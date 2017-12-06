const { pool } = require("../db/connection");

module.exports = (req, res) => {
  return new Promise((resolve, reject) => {
    pool.query("select * from tags limit 10", (error, results) => {
      if (error) {
        reject(error);
      }

      resolve(results);
      res.json(results);
    });
  });
};
