const jimp = require("jimp");
const { createNewHash, saveImage } = require("./utils");

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
