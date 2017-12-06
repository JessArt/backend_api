const express = require("express");

// handlers
const images = require("./images");
const tags = require("./tags");

const wrapAsync = require("../utils/wrapAsync");

const app = express();

app.get("/images", wrapAsync(images));
app.get("/tags", wrapAsync(tags));

module.exports = app;
