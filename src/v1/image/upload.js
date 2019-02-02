const jimp = require("jimp");
const { createNewHash, saveImage, saveGIF } = require("./utils");

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

module.exports.uploadGIF = async (req, res) => {
  const gif = req.file.buffer;

  const name = `${createNewHash()}.gif`;

  const url = await saveGIF({ gif, name });

  res.send({ url });
};
