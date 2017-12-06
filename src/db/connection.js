const mysql = require("mysql");
const { db } = require("../env");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.pets
});

const query = ({ query: sqlQuery, params }) =>
  new Promise((resolve, reject) => {
    pool.query(sqlQuery, params, (error, results) => {
      if (error) {
        return reject(error);
      }

      resolve(results);
    });
  });

const count = async ({ query: sqlQuery, params, property = "total" }) => {
  const result = await query({ query: sqlQuery, params });

  return result[0][property];
};

module.exports = {
  pool,
  count,
  query
};
