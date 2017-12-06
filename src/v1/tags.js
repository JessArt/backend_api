const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { limit = 30, offset = 0 } = req.query;
  const results = await query({
    query: "SELECT * FROM tags LIMIT ? OFFSET ?",
    params: [Number(limit), Number(offset)]
  });

  const total = await count({
    query: "SELECT COUNT(*) AS total FROM tags"
  });

  res.json({
    limit,
    offset,
    total,
    data: results
  });
};
