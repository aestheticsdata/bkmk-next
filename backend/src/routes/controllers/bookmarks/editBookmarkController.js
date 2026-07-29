const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");
const jimpHelper = require("./helpers/jimpHelper");
const generateHexColor = require("./helpers/generateHexColor");

module.exports = async (req, res) => {
  console.log("bookmark edit", req.body);

  const conn = await dbConnection();

  const sqlBookmark = `SELECT * FROM bookmark WHERE id=${req.body.id}`;
  let originalBookmark = null;
  try {
    const result = await conn.execute(sqlBookmark);
    originalBookmark = result[0][0];
  } catch (e) {
    await conn.end();
    return res.status(500).json({ msg: "error getting bookmark : ", e });
  }

  // title
  if (req.body.title !== originalBookmark.title) {
    try {
      await conn.execute(`UPDATE bookmark SET title="${req.body.title}" WHERE id=${originalBookmark.id}`);
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error updating title : ", e });
    }
  }

  // categories
  // one or more categories came in with the request
  const incomingCategories = JSON.parse(req.body.categories);
  if (incomingCategories.length > 0) {
    try {
      const [existingCategories] = await conn.execute(`
        SELECT * FROM bookmark_category WHERE bookmark_id=${originalBookmark.id};
      `);
      // the bookmark has no categories attached yet
      if (existingCategories.length === 0) {
        // for each category in the request
        for (const category of incomingCategories) {
          // this category already exists in the category table
          if (category.id) {
            try {
              await conn.execute(`
                INSERT INTO bookmark_category (bookmark_id, category_id)
                VALUES ("${originalBookmark.id}", "${category.id}");
              `);
            } catch (e) {
              await conn.end();
              return res.status(500).json({
                msg: "error inserting existing categories to bookmark_category table : " + e,
              });
            }

            // this is a new category, to be created in the category table
          } else {
            try {
              const result = await conn.execute(`
                INSERT INTO category (name, color, user_id)
                VALUES ("${category.label}", "${generateHexColor()}", ${originalBookmark.user_id});
              `);
              await conn.execute(`
                INSERT INTO bookmark_category (bookmark_id, category_id)
                VALUES ("${originalBookmark.id}", "${result[0].insertId}");
              `);
            } catch (e) {
              await conn.end();
              return res.status(500).json({ msg: "error inserting new category " + e });
            }
          }
        }

        // the bookmark has categories attached and the request carries one or more
      } else {
        const incomingCategoryIds = incomingCategories.map((category) => {
          return {
            label: category.label,
            id: !isNaN(Number(category.value)) ? Number(category.value) : null,
          };
        });
        const existingCategoryIds = existingCategories.map((category) => category.category_id);

        const categoriesToDelete = existingCategories.filter(
          (category) =>
            !incomingCategories.some((incomingCategory) => incomingCategory.value === category.category_id.toString()),
        );
        if (categoriesToDelete.length > 0) {
          for (const categoryToDelete of categoriesToDelete) {
            try {
              await conn.execute(`
                DELETE FROM bookmark_category
                WHERE bookmark_id=${categoryToDelete.bookmark_id} AND category_id=${categoryToDelete.category_id};
              `);
            } catch (e) {
              await conn.end();
              return res.status(500).json({ msg: "error deleting category in bookmark_category : " + e });
            }
          }
        }

        const categoriesToAdd = incomingCategoryIds.filter((category) => !existingCategoryIds.includes(category.id));
        if (categoriesToAdd.length > 0) {
          for (const categoryToAdd of categoriesToAdd) {
            try {
              const [categories] = await conn.execute(
                `SELECT id FROM category WHERE user_id="${originalBookmark.user_id}";`,
              );
              let result = null;
              if (!categories.some((category) => category.id === categoryToAdd.id)) {
                result = await conn.execute(`
                  INSERT INTO category (name, color, user_id)
                  VALUES ("${categoryToAdd.label}", "${generateHexColor()}", ${originalBookmark.user_id});
                `);
              }
              await conn.execute(`
                INSERT INTO bookmark_category (bookmark_id, category_id)
                VALUES ("${originalBookmark.id}", ${result ? result[0].insertId : categoryToAdd.id});
              `);
            } catch (e) {
              await conn.end();
              return res.status(500).json({ msg: "error creating category and/or bookmark_category : " + e });
            }
          }
        }
      }
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error getting bookmark_category entries : " + e });
    }
    // no categories in the request
  } else {
    try {
      const [existingCategories] = await conn.execute(`
        SELECT * FROM bookmark_category WHERE bookmark_id=${originalBookmark.id};
      `);
      if (existingCategories.length > 0) {
        for (const existingCategory of existingCategories) {
          try {
            await conn.execute(`
              DELETE FROM bookmark_category
              WHERE bookmark_id=${existingCategory.bookmark_id} AND category_id=${existingCategory.category_id};
            `);
          } catch (e) {
            await conn.end();
            return res.status(500).json({ msg: "error deleting bookmark_category : " + e });
          }
        }
      }
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error getting bookmark_category : " + e });
    }
  }

  // url
  let originalURL = null;
  // there is already a url
  if (originalBookmark.url_id) {
    try {
      const result = await conn.execute(`SELECT * FROM url WHERE id=${originalBookmark.url_id}`);
      originalURL = result[0][0];
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error getting url : ", e });
    }

    // a url came in with the request, so overwrite the existing one
    if (req.body.url) {
      try {
        await conn.execute(`UPDATE url SET original="${req.body.url}" WHERE id=${originalURL.id}`);
      } catch (e) {
        await conn.end();
        return res.status(500).json({ msg: "error updating url : ", e });
      }
      // otherwise delete the url and null out bookmark.url_id
    } else {
      try {
        await conn.execute(`UPDATE bookmark SET url_id=NULL WHERE id=${originalBookmark.id}`);
        await conn.execute(`DELETE FROM url WHERE id=${originalURL.id}`);
      } catch (e) {
        await conn.end();
        return res.status(500).json({ msg: "error deleting url : ", e });
      }
    }
    // no url exists yet
  } else {
    // there is a url to create
    if (req.body.url) {
      try {
        const result = await conn.execute(`INSERT INTO url (original) VALUES ("${req.body.url}")`);
        const newURL_ID = result[0].insertId;
        try {
          await conn.execute(`UPDATE bookmark SET url_id=${newURL_ID} WHERE id=${originalBookmark.id};`);
        } catch (e) {
          await conn.end();
          return res.status(500).json({ msg: "error updating bookmark url : ", e });
        }
      } catch (e) {
        await conn.end();
        return res.status(500).json({ msg: "error creating url : ", e });
      }
    }
  }

  // notes
  try {
    if (req.body.notes) {
      await conn.execute(`UPDATE bookmark SET notes="${req.body.notes}" WHERE id=${originalBookmark.id};`);
    } else {
      await conn.execute(`UPDATE bookmark SET notes=NULL WHERE id=${originalBookmark.id};`);
    }
  } catch (e) {
    await conn.end();
    return res.status(500).json({ msg: "error updating notes : ", e });
  }

  // stars
  try {
    await conn.execute(`UPDATE bookmark SET stars=${req.body.stars} WHERE id=${originalBookmark.id}`);
  } catch (e) {
    await conn.end();
    return res.status(500).json({ msg: "error updating stars : ", e });
  }

  // priority
  try {
    await conn.execute(`
      UPDATE bookmark SET priority=${req.body.priority === "" ? null : `"${req.body.priority}"`} WHERE id=${originalBookmark.id}`);
  } catch (e) {
    await conn.end();
    return res.status(500).json({ msg: "error updating priority : ", e });
  }

  // alarm
  // there is already an alarm
  if (originalBookmark.alarm_id) {
    try {
      const [[frequency]] = await conn.execute(`SELECT frequency FROM alarm WHERE id=${originalBookmark.alarm_id};`);
      // an alarm came in with the request
      if (req.body.reminder) {
        // unchanged: do nothing, so the alarm's date_added is not touched
        // otherwise update the frequency and date_added
        if (frequency !== req.body.reminder) {
          try {
            await conn.execute(`UPDATE bookmark SET alarm_id=NULL WHERE id=${originalBookmark.id};`);
            await conn.execute(`DELETE FROM alarm WHERE id=${originalBookmark.alarm_id};`);
            const result = await conn.execute(
              `INSERT INTO alarm (frequency, date_added) VALUES (${req.body.reminder}, "${format(new Date(), "yyyy-MM-dd")}");`,
            );
            const newAlarmID = result[0].insertId;
            await conn.execute(`UPDATE bookmark SET alarm_id=${newAlarmID} WHERE id=${originalBookmark.id};`);
          } catch (e) {
            await conn.end();
            return res.status(500).json({ msg: "error creating new alarm and/or updating bookmark.alarm_id : ", e });
          }
        }
        // no alarm in the request: delete the existing one and null out bookmark.alarm_id
      } else {
        try {
          await conn.execute(`UPDATE bookmark SET alarm_id=NULL WHERE id=${originalBookmark.id};`);
          await conn.execute(`DELETE FROM alarm WHERE id=${originalBookmark.alarm_id};`);
        } catch (e) {
          await conn.end();
          return res.status(500).json({ msg: "error deleting and/or updating to NULL bookmark alarm_id : ", e });
        }
      }
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error getting alarm : ", e });
    }
    // no alarm exists yet
  } else {
    // there is an alarm to create
    if (req.body.reminder) {
      try {
        const result = await conn.execute(
          `INSERT INTO alarm (frequency, date_added) VALUES (${req.body.reminder}, "${format(new Date(), "yyyy-MM-dd")}");`,
        );
        const newAlarmID = result[0].insertId;
        try {
          await conn.execute(`UPDATE bookmark SET alarm_id=${newAlarmID} WHERE id=${originalBookmark.id};`);
        } catch (e) {
          await conn.end();
          return res.status(500).json({ msg: "error updating bookmark.alarm_id : ", e });
        }
      } catch (e) {
        await conn.end();
        return res.status(500).json({ msg: "error creating new alarm and/or updating bookmark.alarm_id : ", e });
      }
    }
  }

  // screenshot
  const deleteScreenshot = async () => {
    const [[result]] = await conn.execute(
      `SELECT screenshot FROM bookmark WHERE id=${originalBookmark.id} and user_id=${originalBookmark.user_id};`,
    );
    const filename = result.screenshot;
    try {
      await jimpHelper.deleteScreenshot({ filename, userID: originalBookmark.user_id });
      try {
        await conn.execute(`
          UPDATE bookmark
          SET screenshot=NULL
          WHERE id=${originalBookmark.id} AND user_id=${originalBookmark.user_id};
        `);
      } catch (e) {
        await conn.end();
        return res.status(500).json({ msg: "error removing screenshot from bookmark entry : " + e });
      }
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error unlink file : " + e });
    }
  };

  // new screenshot
  if (req.file) {
    const userID = req.decoded.id; // from jwt token middleware
    const [[existingScreenshot]] = await conn.execute(`
      SELECT screenshot FROM bookmark WHERE id=${originalBookmark.id} AND user_id=${userID};
    `);
    if (existingScreenshot.screenshot) {
      try {
        await deleteScreenshot();
      } catch (e) {
        await conn.end();
        return res.status(500).json({ msg: "error deleting screenshot : " + e });
      }
    }

    try {
      const screenshotFilename = await jimpHelper.createScreenshot({
        file: req.file,
        userID,
      });
      await conn.execute(`
        UPDATE bookmark
        SET screenshot="${screenshotFilename}"
        WHERE id=${originalBookmark.id} AND user_id=${userID};
      `);
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error creating new screenshot : " + e });
    }
  }

  // screenshot removed
  if (req.body.deleteScreenshot) {
    await deleteScreenshot();
  }

  conn.execute(
    `UPDATE bookmark SET date_last_modified="${format(new Date(), "yyyy-MM-dd")}" WHERE id=${originalBookmark.id}`,
  );

  await conn.end();
  return res.status(200).json({ msg: "bookmark edited" });
};
