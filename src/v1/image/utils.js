const jimp = require("jimp");
const path = require("path");
const { queryOne, query } = require("../../db/connection");
const { images: { path: pathToImages } } = require("../../env");

const LETTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";

const NUM = LETTERS.length;

module.exports.createNewHash = function createNewHash() {
  const result = [];
  for (let i = 0; i < 16; i++) {
    const index = Math.floor(Math.random() * NUM);
    result.push(LETTERS[index]);
  }

  return result.join("");
};

module.exports.saveImage = function saveImage({
  image: rawImage,
  width,
  name
}) {
  const image = rawImage.clone();

  const resizedImage = image.resize(width, jimp.AUTO);
  const ext = "jpg";

  image.quality(95);

  const imageName = `${name}_${width}.${ext}`;

  return new Promise(resolve =>
    resizedImage.write(path.join(pathToImages, imageName), () => {
      resolve(`https://static.jess.gallery/${imageName}`);
    })
  );
};

module.exports.uploadTags = async function uploadTags({ tags, imageId }) {
  if (!tags || tags.length === 0) {
    return;
  }

  await query({
    query: "DELETE FROM tags_images WHERE image_id = ?",
    params: [Number(imageId)]
  });

  const resolvedTags = await Promise.all(
    (Array.isArray(tags) ? tags : [tags]).map(async tag => {
      if (!isNaN(tag)) {
        return tag;
      } else {
        // check that this tag does not exist yet
        const result = await queryOne({
          query: "SELECT * from tags WHERE name = ?",
          params: [tag]
        });

        if (result) {
          return result.id;
        } else {
          return query({
            query: "INSERT INTO tags (name) VALUES (?)",
            params: [tag]
          }).then(result => result.insertId);
        }
      }
    })
  );

  await Promise.all(
    resolvedTags.map(tag =>
      query({
        query: "INSERT INTO tags_images (tag_id, image_id) VALUES (?, ?)",
        params: [Number(tag), Number(imageId)]
      })
    )
  );
};

module.exports.resolvedTags = async function resolveTags({ tags }) {
  const tagsArray = Array.isArray(tags) ? tags : [tags];

  const resolvedTagsArray = await Promise.all(
    tagsArray.map(async tag => {
      const relatedTags = await query({
        query:
          "SELECT contained_id as tagId from tags_relations WHERE parent_id = ?",
        params: [Number(tag)]
      });

      if (relatedTags && relatedTags.length) {
        return resolveTags({
          tags: relatedTags.map(({ tagId }) => tagId)
        }).then(resolvedTags => [tag].concat(resolvedTags));
      } else {
        return tag;
      }
    })
  );

  return resolvedTagsArray.reduce((arr, value) => arr.concat(value), []);
};
