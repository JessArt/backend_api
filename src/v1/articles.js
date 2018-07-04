const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { pageNumber = 0, pageSize: limit = 30, drafts } = req.query;
  const offset = pageNumber * limit;

  const draftsCondition = drafts ? "" : "WHERE published_on IS NOT NULL";

  const results = await query({
    query: `SELECT * FROM articles ${draftsCondition} ORDER BY id DESC LIMIT ? OFFSET ?`,
    params: [Number(limit), Number(offset)]
  });

  const total = await count({
    query: `SELECT COUNT(*) AS total FROM articles ${draftsCondition}`
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
