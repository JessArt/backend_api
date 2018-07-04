const { queryOne, query } = require("../db/connection");

module.exports.get = async (req, res) => {
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

module.exports.post = async (req, res) => {
  const {
    title,
    subtitle,
    meta_title,
    meta_description,
    keywords,
    cover,
    city,
    text
  } = req.body;

  const result = await query({
    query: `
    INSERT INTO articles
    (title, subtitle, meta_title, meta_description, keywords, cover, city, text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      title,
      subtitle,
      meta_title,
      meta_description,
      keywords,
      cover,
      city,
      text
    ]
  });

  res.send({
    status: "success"
  });
};

module.exports.put = async (req, res) => {
  const {
    title,
    subtitle,
    meta_title,
    meta_description,
    keywords,
    cover,
    city,
    text,
    published_on
  } = req.body;

  const { id } = req.params;

  const publishedDate = new Date(published_on);

  const result = await query({
    query: `
    UPDATE articles SET
    title = ?,
    subtitle = ?,
    meta_title = ?,
    meta_description = ?,
    keywords = ?,
    cover = ?,
    city = ?,
    text = ?,
    published_on = ?
    WHERE id = ?`,
    params: [
      title,
      subtitle,
      meta_title,
      meta_description,
      keywords,
      cover,
      city,
      text,
      publishedDate === "Invalid Date" ? null : publishedDate,
      id
    ]
  });

  res.send({
    status: "success"
  });
};
