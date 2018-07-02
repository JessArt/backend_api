const jimp = require("jimp");
const path = require("path");
const { images: { path: pathToImages } } = require("../env");
const { queryOne, query } = require("../db/connection");

module.exports.get = async (req, res) => {
  const { id } = req.params;

  const result = await queryOne({
    query: "SELECT * FROM images WHERE id = ?",
    params: [id]
  });

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({
      error: "not_found"
    });
  }
};

module.exports.post = async function post(req, res) {
  const imageBuffer = req.file;

  const {
    title,
    type,
    tags,
    description,
    keywords,
    date,
    location,
    metaTitle,
    metaDescription
  } = req.body;

  const image = await jimp.read(imageBuffer.buffer);
  const name = createNewHash();

  const smallImagePromise = saveImage({
    name,
    image,
    width: 500
  });
  const bigImagePromise = saveImage({
    name,
    image,
    width: 1200
  });

  const [smallImageURL, bigImageURL] = await Promise.all([
    smallImagePromise,
    bigImagePromise
  ]);

  const result = await query({
    query: `
      INSERT INTO images
      (title, small_url, big_url, type,
        description, meta_title, meta_description, keywords,
        original_height, original_width, location, date)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      title,
      smallImageURL,
      bigImageURL,
      type,
      description,
      metaTitle,
      metaDescription,
      keywords,
      image.bitmap.height,
      image.bitmap.width,
      location,
      date
    ]
  });

  await uploadTags({ tags, imageId: result.insertId });

  res.json({
    status: "success"
  });
};

module.exports.put = async function put(req, res) {
  // const imageBuffer = req.file;

  const { id } = req.params;

  const {
    title,
    type,
    tags,
    description,
    keywords,
    date,
    location,
    metaTitle,
    metaDescription
  } = req.body;

  let imageSQL = "";
  const imageParams = [];

  if (req.file) {
    const imageBuffer = req.file;
    const image = await jimp.read(imageBuffer.buffer);
    const name = createNewHash();
    const smallImagePromise = saveImage({
      name,
      image,
      width: 500
    });
    const bigImagePromise = saveImage({
      name,
      image,
      width: 1200
    });

    const [smallImageURL, bigImageURL] = await Promise.all([
      smallImagePromise,
      bigImagePromise
    ]);

    imageSQL = `
    small_url = ?,
    big_url = ?,
    original_height = ?,
    original_width = ?
    `;
    imageParams.push(
      smallImageURL,
      bigImageURL,
      image.bitmap.height,
      image.bitmap.width
    );
  }

  const result = await query({
    query: `
      UPDATE images
      SET title = ?,
      type = ?,
      description = ?,
      meta_title = ?,
      meta_description = ?,
      keywords = ?,
      date = ?,
      location = ?${imageSQL ? "," : ""}
      ${imageSQL}
      WHERE id = ?`,
    params: [
      title,
      type,
      description,
      metaTitle,
      metaDescription,
      keywords,
      date,
      location,
      ...imageParams,
      id
    ]
  });

  await uploadTags({ imageId: id, tags });

  res.send({
    status: "success"
  });
};

module.exports.upload = async (req, res) => {
  const imageBuffer = req.file;

  const image = await jimp.read(imageBuffer.buffer);

  const name = createNewHash();
  const url = await saveImage({
    name,
    image,
    width: 1200
  });

  res.send({
    url
  });
};

function saveImage({ image: rawImage, width, name }) {
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
}

const LETTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";

const NUM = LETTERS.length;

function createNewHash() {
  const result = [];
  for (let i = 0; i < 16; i++) {
    const index = Math.floor(Math.random() * NUM);
    result.push(LETTERS[index]);
  }

  return result.join("");
}

async function uploadTags({ tags, imageId }) {
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
}
