const jimp = require("jimp");
const { createNewHash, saveImage, uploadTags } = require("./utils");
const { query } = require("../../db/connection");

module.exports.put = async function put(req, res) {
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

  await query({
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
