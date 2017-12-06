const { queryOne } = require("../db/connection");

module.exports = async (req, res) => {
  const { id } = req.params;

  const result = await queryOne({
    query: "SELECT * FROM articles WHERE id = ?",
    params: [id]
  });

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({
      error: "not_found"
    });
  }
};
