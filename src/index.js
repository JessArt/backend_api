const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const v1 = require("./v1/index");
const v2 = require("./v2/index");
const login = require("./login");

const app = express();
app.use(cors());
app.use("/v1", v1);
app.use("/v2", v2);
app.post("/login", upload.none(), login.request);
app.get("/validate_token", login.validateToken);

const PORT = 4003;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API is listening at port ${PORT}`);
});
