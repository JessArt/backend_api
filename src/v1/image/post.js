const jimp = require("jimp");
const { query } = require("../../db/connection");
const { createNewHash, saveImage, uploadTags } = require("./utils");

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
