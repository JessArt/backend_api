const { query, queryOne } = require("../../db/connection");

module.exports.getRandom = async function(req, res) {
  const results = await query({
    query: `SELECT id FROM images WHERE type = ?`,
    params: ["photo"]
  });

  const randomIndex = Math.floor(Math.random() * results.length);
  const randomId = results[randomIndex].id;

  const result = await queryOne({
    query: "SELECT * FROM images WHERE id = ?",
    params: [randomId]
  });

  res.json({
    image: result
  });
};
