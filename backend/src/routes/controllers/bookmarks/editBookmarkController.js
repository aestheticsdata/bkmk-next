const { format } = require('date-fns');
const dbConnection = require('../../../db/dbinitmysql');
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
    return res.status(500).json({ msg: "error getting bookmark : ", e });
  }

  // title
  if (req.body.title !== originalBookmark.title) {
    try {
      await conn.execute(`UPDATE bookmark SET title="${req.body.title}" WHERE id=${originalBookmark.id}`);
    } catch (e) {
      return res.status(500).json({ msg: "error updating title : ", e });
    }
  }

  // categories
  // il y a une ou plusieurs catégories dans la requete
  const incomingCategories = JSON.parse(req.body.categories);
  if (incomingCategories.length > 0) {
    try {
      const [existingCategories] = await conn.execute(`
        SELECT * FROM bookmark_category WHERE bookmark_id=${originalBookmark.id};
      `);
      // il n'y a pas encore de catégories associées au bookmark
      if (existingCategories.length === 0) {
        // pour chaque catégorie de la requete
        for (const category of incomingCategories) {
          // c'est une catégorie qui existe deja dans la table catégorie
          if (category.id) {
            try {
              await conn.execute(`
                INSERT INTO bookmark_category (bookmark_id, category_id)
                VALUES ("${originalBookmark.id}", "${category.id}");
              `);
            } catch (e) {
              return res.status(500).json({
                msg: "error inserting existing categories to bookmark_category table : " + e
              });
            }

            // c'est une nouvelle catégorie à créer dans la table catégorie
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
              return res.status(500).json({ msg: "error inserting new category " + e });
            }
          }
        }

      // il y des catégories associées au bookmark et il y une ou plusieurs catégories dans la requete
      } else {
        const incomingCategoryIds = incomingCategories.map(category => {
          return {
            label: category.label,
            id: !isNaN(Number(category.value)) ? Number(category.value) : null,
          }
        });
        const existingCategoryIds = existingCategories.map(category => category.category_id);

        const categoriesToDelete = existingCategories.filter(category =>
          !incomingCategories.some(incomingCategory => incomingCategory.value === category.category_id.toString())
        );
        if (categoriesToDelete.length > 0) {
          for (const categoryToDelete of categoriesToDelete) {
            try {
              await conn.execute(`
                DELETE FROM bookmark_category
                WHERE bookmark_id=${categoryToDelete.bookmark_id} AND category_id=${categoryToDelete.category_id};
              `);
            } catch (e) {
              return res.status(500).json({ msg: "error deleting category in bookmark_category : " + e });
            }
          }
        }

        const categoriesToAdd = incomingCategoryIds.filter((category) => !existingCategoryIds.includes(category.id));
        if (categoriesToAdd.length > 0) {
          for (const categoryToAdd of categoriesToAdd) {
            try {
              const result = await conn.execute(`
                INSERT INTO category (name, color, user_id)
                VALUES ("${categoryToAdd.label}", "${generateHexColor()}", ${originalBookmark.user_id});
              `);
              await conn.execute(`
                INSERT INTO bookmark_category (bookmark_id, category_id)
                VALUES ("${originalBookmark.id}", "${result[0].insertId}");
              `);
            } catch (e) {
              return res.status(500).json({ msg: "error creating category and/or bookmark_category : " + e });
            }
          }
        }
      }
    } catch (e) {
      return res.status(500).json({ msg: "error getting bookmark_category entries : " + e });
    }
  // il n'y pas de catégories dans la requete
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
            return res.status(500).json({ msg: "error deleting bookmark_category : " + e });
          }
        }
      }
    } catch (e) {
      return res.status(500).json({ msg: "error getting bookmark_category : " + e });
    }
  }


  // url
  let originalURL = null;
  // si il y a deja une url
  if (originalBookmark.url_id) {
    try {
      const result = await conn.execute(`SELECT * FROM url WHERE id=${originalBookmark.url_id}`);
      originalURL = result[0][0];
    } catch (e) {
      return res.status(500).json({ msg: "error getting url : ", e });
    }

    // si il y a une url dans la requete, alors écraser celle existante
    if (req.body.url) {
      try {
        await conn.execute(`UPDATE url SET original="${req.body.url}" WHERE id=${originalURL.id}`);
      } catch (e) {
        return res.status(500).json({ msg: "error updating url : ", e });
      }
    // sinon supprimer l'url et mettre à null url_id dans bookmark
    } else {
      try {
        await conn.execute(`UPDATE bookmark SET url_id=NULL WHERE id=${originalBookmark.id}`);
        await conn.execute(`DELETE FROM url WHERE id=${originalURL.id}`);
      } catch (e) {
        return res.status(500).json({ msg: "error deleting url : ", e });
      }
    }
  // il n'y pas encore d'url existante
  } else {
    // il y a une url à créer
    if (req.body.url) {
      try {
        const result = await conn.execute(`INSERT INTO url (original) VALUES ("${req.body.url}")`);
        const newURL_ID = result[0].insertId;
        try {
          await conn.execute(`UPDATE bookmark SET url_id=${newURL_ID}`);
        } catch (e) {
          return res.status(500).json({ msg: "error updating bookmark url : ", e });
        }
      } catch (e) {
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
    return res.status(500).json({ msg: "error updating notes : ", e });
  }


  // stars
  try {
    await conn.execute(`UPDATE bookmark SET stars=${req.body.stars} WHERE id=${originalBookmark.id}`);
  } catch (e) {
    return res.status(500).json({ msg: "error updating stars : ", e });
  }

  // priority
  try {
    await conn.execute(`
      UPDATE bookmark SET priority=${req.body.priority === '' ? null : `"${req.body.priority}"`} WHERE id=${originalBookmark.id}`
    );
  } catch (e) {
    return res.status(500).json({ msg: "error updating priority : ", e });
  }

  // alarm
  // si il y a deja une alarm
  if (originalBookmark.alarm_id) {
    try {
      const [[frequency]] = await conn.execute(`SELECT frequency FROM alarm WHERE id=${originalBookmark.alarm_id};`);
      // si il y a une alarm dans la requete
      if (req.body.reminder) {
        // si il n'y pas de changement, ne rien faire pour ne pas modifier la date_added de l'alarm
        // sinon modifier la frequence et la date_added
        if (frequency !== req.body.reminder) {
          try {
            await conn.execute(`UPDATE bookmark SET alarm_id=NULL WHERE id=${originalBookmark.id};`);
            await conn.execute(`DELETE FROM alarm WHERE id=${originalBookmark.alarm_id};`);
            const result = await conn.execute(`INSERT INTO alarm (frequency, date_added) VALUES (${req.body.reminder}, "${format(new Date(), 'yyyy-MM-dd')}");`);
            const newAlarmID = result[0].insertId;
            await conn.execute(`UPDATE bookmark SET alarm_id=${newAlarmID} WHERE id=${originalBookmark.id};`);
          } catch (e) {
            return res.status(500).json({ msg: "error creating new alarm and/or updating bookmark.alarm_id : ", e });
          }
        }
      // si il n'y a pas d'alarm dans la requete, alors supprimer l'alarm existante et mettre à null alarm_id dans bookmark
      } else {
        try {
          await conn.execute(`UPDATE bookmark SET alarm_id=NULL WHERE id=${originalBookmark.id};`);
          await conn.execute(`DELETE FROM alarm WHERE id=${originalBookmark.alarm_id};`);
        } catch (e) {
          return res.status(500).json({ msg: "error deleting and/or updating to NULL bookmark alarm_id : ", e });
        }
      }
    } catch (e) {
      return res.status(500).json({ msg: "error getting alarm : ", e });
    }
  // il n'y pas encore d'alarm existante
  } else {
    // il a une alarm à créer
    if (req.body.reminder) {
      try {
        const result = await conn.execute(`INSERT INTO alarm (frequency, date_added) VALUES (${req.body.reminder}, "${format(new Date(), 'yyyy-MM-dd')}");`);
        const newAlarmID = result[0].insertId;
        try {
          await conn.execute(`UPDATE bookmark SET alarm_id=${newAlarmID} WHERE id=${originalBookmark.id};`);
        } catch (e) {
          return res.status(500).json({ msg: "error updating bookmark.alarm_id : ", e });
        }
      } catch (e) {
        return res.status(500).json({ msg: "error creating new alarm and/or updating bookmark.alarm_id : ", e });
      }
    }
  }


  // screenshot


  conn.execute(`UPDATE bookmark SET date_last_modified= "${format(new Date(), 'yyyy-MM-dd')}" WHERE id=${originalBookmark.id}`)

  conn.end();
  return res.status(200).json({ msg: "bookmark edited" });
}
