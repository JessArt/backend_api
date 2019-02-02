const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");

const login = require("../login");

const upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 }
});

// handlers
const image = require("./image");

const article = require("./article");
const articles = require("./articles");

const feedback = require("./feedback");
const progress = require("./progress");
const subscribe = require("./subscribe");

const tags = require("./tags");

const wrapAsync = require("../utils/wrapAsync");

const app = express();

app.get("/images/:id", wrapAsync(image.get));
app.get("/images", wrapAsync(image.getMany));
app.get("/articles/:id", wrapAsync(article.get));
app.get("/articles", wrapAsync(articles));
app.get("/tags", wrapAsync(tags.get));
app.get("/image_tags/:id", wrapAsync(tags.imageTags));
app.get("/top_tags", wrapAsync(tags.getTopTags));
app.get("/nested_tags", wrapAsync(tags.getNestedTags));

app.get("/progress", progress.get);

app.post("/images", [login.middleware, upload.single("image")], image.post);
app.post(
  "/images/upload",
  [login.middleware, upload.single("image")],
  image.upload
);
app.post(
  "/images/upload_gif",
  [login.middleware, upload.single("gif")],
  image.uploadGIF
);
app.post(
  "/articles",
  [login.middleware, upload.none()],
  wrapAsync(article.post)
);
app.post("/tags", [login.middleware, upload.none()], wrapAsync(tags.post));

app.post("/feedback", bodyParser.json(), wrapAsync(feedback.post));
app.post("/subscribe", bodyParser.json(), wrapAsync(subscribe.post));

app.post(
  "/top_tags",
  [login.middleware, upload.none()],
  wrapAsync(tags.updateTopTags)
);

app.put(
  "/articles/:id",
  [login.middleware, upload.none()],
  wrapAsync(article.put)
);
app.put(
  "/images/:id",
  [login.middleware, upload.single("image")],
  wrapAsync(image.put)
);
app.put("/tags/:id", [login.middleware, upload.none()], wrapAsync(tags.put));

app.delete("/images/:id", [login.middleware], wrapAsync(image.remove));

module.exports = app;
