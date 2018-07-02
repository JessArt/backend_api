const express = require("express");

const articles = require("./articles");
const tags = require("./tags");

const wrapAsync = require("../utils/wrapAsync");

const app = express();

app.get("/articles", wrapAsync(articles));
app.get("/top_tags", wrapAsync(tags.getTopTags));
app.get("/nested_tags", wrapAsync(tags.getNestedTags));

module.exports = app;
