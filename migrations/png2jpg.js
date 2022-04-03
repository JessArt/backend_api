const path = require("path");
const glob = require("glob");
const jimp = require("jimp");
const rimraf = require("rimraf");
const { images } = require("../src/env");
const { query } = require("../src/db/connection");

const pngFilesGlob = `${images.path}/*.png`;

/**
 * find all PNG files and convert them into JPG files
 */
function createJPGs() {
  return new Promise((resolve, reject) => {
    glob(pngFilesGlob, (err, files) => {
      if (err) {
        reject(new Error("error during reading png files in the images path"));
      } else {
        files
          .reduce((promise, filePath) => {
            return promise.then(() => {
              return jimp
                .read(filePath)
                .then(rawImage => {
                  const image = rawImage.clone();
                  image.quality(95);

                  const filePathParts = filePath.split("/");
                  const originalImageName =
                    filePathParts[filePathParts.length - 1];
                  const imageName = replaceExtension(originalImageName);

                  return new Promise(resolve =>
                    image.write(path.join(images.path, imageName))
                  );
                })
                .catch(reject);
            });
          }, Promise.resolve())
          .then(resolve);
      }
    });
  });
}

function replaceExtension(name) {
  if (name) {
    return name.replace(/(\d+)\.png$/, "$1.jpg");
  } else {
    return name;
  }
}

async function updateImages() {
  const result = await query({
    query:
      "SELECT id, small_url, big_url FROM images WHERE small_url LIKE '%.png'"
  });

  if (result) {
    return Promise.all(
      result.map(imageRow => {
        return query({
          query: "UPDATE images SET small_url = ?, big_url = ? WHERE id = ?",
          params: [
            replaceExtension(imageRow.small_url),
            replaceExtension(imageRow.big_url),
            imageRow.id
          ]
        });
      })
    );
  } else {
    throw new Error("error during reading images with PNG images");
  }
}

async function updateArticles() {
  const result = await query({
    query: "SELECT id, text, cover FROM articles"
  });

  if (result) {
    return Promise.all(
      result.map(article =>
        query({
          query: "UPDATE articles SET text = ?, cover = ? WHERE id = ?",
          params: [
            processText(article.text),
            replaceExtension(article.cover),
            article.id
          ]
        })
      )
    );
  } else {
    throw new Error("error during reading articles");
  }
}

function processText(text) {
  if (text) {
    return text.replace(
      /(https:\/\/static.jess.gallery\/.+?_\d+)\.png/g,
      "$1.jpg"
    );
  } else {
    return text;
  }
}

function deletePngs() {
  return new Promise((resolve, reject) => {
    rimraf(pngFilesGlob, err => {
      if (err) {
        reject(new Error("error during removing pngs"));
      } else {
        resolve();
      }
    });
  });
}

async function migratePNGToJPG() {
  console.log("start to create JPGs");
  await createJPGs();
  console.log("start to update images");
  await updateImages();
  console.log("start to update articles");
  await updateArticles();
  // await deletePngs();
}

migratePNGToJPG()
  .then(() => {
    console.log("success!!");
    process.exit(0);
  })
  .catch(e => {
    console.log("ERROR!", e);
    process.exit(1);
  });
