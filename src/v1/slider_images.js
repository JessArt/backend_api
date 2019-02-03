const { query } = require("../db/connection");

module.exports.get = async (req, res) => {
  const images = await query({
    query: "SELECT url FROM slider_images ORDER BY position ASC"
  });

  if (images) {
    res.json(images.map(({ url }) => url));
  } else {
    res.status(500).json({
      status: "error"
    });
  }
};

module.exports.post = async (req, res) => {
  const { images } = req.body;

  if (!images || images.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "You can not save 0 images"
    });
  }

  await query({
    query: "DELETE FROM slider_images"
  });

  const insertOperation = await query({
    query: "INSERT INTO slider_images (position, url) VALUES ?",
    // from here: https://stackoverflow.com/a/14259347/3218277
    params: [images.map((url, index) => [index, url])]
  });

  if (insertOperation) {
    res.json({
      status: "success"
    });
  } else {
    res.status(500).json({
      status: "error"
    });
  }
};
