const express = require("express");

// handlers
const image = require("./image");
const images = require("./images");

const article = require("./article");
const articles = require("./articles");

const tags = require("./tags");

const wrapAsync = require("../utils/wrapAsync");

const app = express();

app.get("/images/:id", wrapAsync(image));
app.get("/images", wrapAsync(images));
app.get("/articles/:id", wrapAsync(article));
app.get("/articles", wrapAsync(articles));
app.get("/tags", wrapAsync(tags));

module.exports = app;
