const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const OS = require("os");
const cronMysql = require('./cron/cron-mysql');
const screenshotsImagesBackup = require("./screenshotsBackup/screenshotsBackup");

process.env.UV_THREADPOOL_SIZE = OS.cpus().length;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/users", require("./routes/api/users"));
app.use("/bookmarks", require("./routes/api/bookmarks"));
app.use("/categories", require("./routes/api/categories"));
app.use("/reminders", require("./routes/api/reminders"));

if (process.env.PROD) {
  screenshotsImagesBackup();
  cronMysql();
}

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));
