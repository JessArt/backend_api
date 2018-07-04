const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { pageNumber = 0, pageSize: limit = 30, drafts } = req.query;
  const offset = pageNumber * limit;

  const draftsCondition = drafts ? "" : "WHERE published_on IS NOT NULL";
  const published = drafts ? ", published_on" : "";

  // we get only a subset of values from articles
  // this is the difference between v1 and v2 endpoints
  // the reason is that the body can contain _a lot_ of characters,
  // and the payload can easily be ~200–300 KB.
  const results = await query({
    query: `SELECT id, title, subtitle, cover ${published} FROM articles ${draftsCondition} ORDER BY id DESC LIMIT ? OFFSET ?`,
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
