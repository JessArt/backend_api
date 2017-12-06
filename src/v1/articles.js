const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const results = await query({
    query: "SELECT * FROM articles LIMIT ? OFFSET ?",
    params: [Number(limit), Number(offset)]
  });

  const total = await count({
    query: "SELECT COUNT(*) AS total FROM articles"
  });

  res.json({
    limit,
    offset,
    total,
    data: results
  });
};
