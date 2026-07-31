const { format } = require("date-fns");
const anyASCII = require("../../../helpers/anyascii");
const dbConnection = require("../../../db/dbinitmysql");

module.exports = async (req, res) => {
  const userID = req.user.id; // from sessionAuthMiddleware
  const originalName = req.file.originalname;
  const entries = [];
  const buffer = Buffer.from(req.file.buffer);
  const arr = buffer.toString().split("\n");

  /* ⚠️ **The last dot segment, not the second** (COS-303). This read `split(".")[1]`, so
   * `session_buddy.2026_07_11.csv` answered `"2026_07_11"` and fell into the `.txt` branch — a csv
   * read as pairs of lines, which imports garbage rather than failing. `parseImport.ts` on the front
   * makes the same call, and the preview would have shown the same garbage; both are fixed. */
  if (originalName.toLowerCase().split(".").pop() === "csv") {
    /* ⚠️ **A line with no `;` is skipped rather than fatal** (COS-303). Every line was destructured
     * and `.trim()` called on the second half, so the empty string `split("\n")` leaves after a
     * trailing newline threw a `TypeError` — which `catchAsync` turned into a 500. Nearly every csv
     * ends with a newline, so nearly every csv import failed on the last line, after having already
     * inserted every row before it. */
    arr.forEach((entry) => {
      if (entry.trim() === "") return;
      const [title, link] = entry.split(";");
      if (!title || !title.trim() || !link || !link.trim()) return;
      entries.push({ title: title.trim(), link: link.trim() });
    });
  } else {
    arr.splice(0, 2);
    for (let i = 0; i < arr.length; i += 2) {
      const title = arr[i];
      const link = arr[i + 1];
      if (title && link) {
        entries.push({ title: title.trim(), link: link.trim() });
      }
      if (arr[i + 2] === "") {
        i++;
      }
    }
  }

  const conn = await dbConnection();

  for (const bookmark of entries) {
    let urlID = null;
    // Prepared, not interpolated (COS-295): both values come from the uploaded file.
    const sqlUrl = "INSERT INTO url (original) VALUES (?);";
    try {
      const result = await conn.execute(sqlUrl, [bookmark.link]);
      urlID = result[0].insertId;
    } catch (err) {
      await conn.end();
      return res.status(500).json({ msg: "error creating url : " + err, url: bookmark.link });
    }

    const bookmarkTitle = bookmark.title.length > 120 ? bookmark.title.substring(0, 119) : bookmark.title;
    try {
      await conn.execute(
        `
        INSERT INTO bookmark (title, user_id, url_id, date_added)
        VALUES (?, ?, ?, ?);
      `,
        [encodeURIComponent(anyASCII(bookmarkTitle)), userID, urlID, format(new Date(), "yyyy-MM-dd")],
      );
    } catch (e) {
      await conn.end();
      return res.status(500).json({ msg: "error creating bookmark : " + e, title: bookmarkTitle });
    }
  }

  await conn.end();
  res.status(200).json({ msg: "bookmarks upload success" });
};
