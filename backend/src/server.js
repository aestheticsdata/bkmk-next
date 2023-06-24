const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const OS = require("os");

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/users", require("./routes/api/users"));
app.use("/bookmarks", require("./routes/api/bookmarks"));
app.use("/categories", require("./routes/api/categories"));

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));
