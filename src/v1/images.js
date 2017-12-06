const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { offset = 0, limit = 10, tags } = req.query;
  if (!tags) {
    const results = await query({
      query: "SELECT * FROM images LIMIT ? OFFSET ?",
      params: [Number(limit), Number(offset)]
    });

    const total = await count({
      query: "SELECT COUNT(*) AS total FROM images"
    });

    res.json({
      offset,
      limit,
      total,
      data: results
    });
  } else {
    const sqlQuery = `
    SELECT * FROM
    (SELECT * FROM images
      INNER JOIN tags_images
      ON images.id = tags_images.image_id) t
    WHERE tag_id IN (?)
    LIMIT ? OFFSET ?`;
    const results = await query({
      query: sqlQuery,
      params: [tags, Number(limit), Number(offset)]
    });

    const countQuery = `
    SELECT COUNT(*) AS total FROM
    (SELECT * FROM images
      INNER JOIN tags_images
      ON images.id = tags_images.image_id) t
    WHERE tag_id IN (?)`;
    const total = await count({ query: countQuery, params: [tags] });

    console.log(total);

    res.json({
      offset,
      limit,
      total,
      data: results
    });
  }
};
