const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { pageNumber = 0, pageSize: limit = 30 } = req.query;
  const offset = pageNumber * limit;
  const results = await query({
    query: "SELECT * FROM articles ORDER BY id DESC LIMIT ? OFFSET ?",
    params: [Number(limit), Number(offset)]
  });

  const total = await count({
    query: "SELECT COUNT(*) AS total FROM articles"
  });

  res.json({
    meta: {
      limit,
      offset,
      page_size: total,
      elements: results.length
    },
    data: results
  });
};
