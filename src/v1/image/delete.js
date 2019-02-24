const { queryOne, query } = require("../../db/connection");
const { removeImage } = require("./utils");

module.exports.remove = async (req, res) => {
  const { id } = req.params;

  const result = await queryOne({
    query: "SELECT * FROM images WHERE id = ?",
    params: [id]
  });

  if (!result) {
    res.statusCode = 404;
    res.json({
      status: "Error",
      message: `Image with id ${id} was not found.`
    });

    return;
  }

  try {
    await Promise.all(
      [result.small_url, result.big_url].map(getFileName).map(removeImage)
    );
  } catch (e) {
    /* eslint-disable no-console */
    console.log("Error during removing following images:");
    console.log(result.small_url);
    console.log(result.big_url);
    console.log("with error:::", e);
    /* eslint-enable no-console */
  }

  try {
    await query({
      query: "DELETE from tags_images where image_id = ?",
      params: [id]
    });

    await query({
      query: "DELETE from images WHERE id = ?",
      params: [id]
    });
  } catch (e) {
    res.statusCode = 500;
    res.json({
      status: "error",
      message: "Internal server error"
    });
  }

  res.json({
    status: "success"
  });
};

function getFileName(url) {
  const splittedURL = url.split("/");

  return splittedURL[splittedURL.length - 1];
}
