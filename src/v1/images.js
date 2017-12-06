const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { offset = 0, limit = 10, tags, type } = req.query;
  if (!tags) {
    const typeCond = type ? "WHERE type = ?" : "";
    const typeParam = type ? [type] : [];
    const results = await query({
      query: `SELECT * FROM images ${typeCond} LIMIT ? OFFSET ?`,
      params: typeParam.concat([Number(limit), Number(offset)])
    });

    const total = await count({
      query: `SELECT COUNT(*) AS total FROM images ${typeCond}`,
      params: typeParam
    });

    res.json({
      offset,
      limit,
      total,
      data: results
    });
  } else {
    const typeCond = type ? "AND type = ?" : "";
    const typeParam = type ? [type] : [];
    const sqlQuery = `
    SELECT * FROM
    (SELECT * FROM images
      INNER JOIN tags_images
      ON images.id = tags_images.image_id) t
    WHERE tag_id IN (?) ${typeCond}
    LIMIT ? OFFSET ?`;
    const results = await query({
      query: sqlQuery,
      params: typeParam.concat([tags, Number(limit), Number(offset)])
    });

    const countQuery = `
    SELECT COUNT(*) AS total FROM
    (SELECT * FROM images
      INNER JOIN tags_images
      ON images.id = tags_images.image_id) t
    WHERE tag_id IN (?) ${typeCond}`;
    const total = await count({
      query: countQuery,
      params: typeParam.concat([tags])
    });

    res.json({
      offset,
      limit,
      total,
      data: results
    });
  }
};
