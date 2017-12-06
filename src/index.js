const express = require("express");
const cors = require("cors");
const v1 = require("./v1/index");

const app = express();
app.use(cors());
app.use("/v1", v1);

app.listen("3000");
