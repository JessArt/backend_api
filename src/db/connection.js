const mysql = require("mysql");
const { db } = require("../env");

// we create just one pool for the whole lifetime of the application
const pool = mysql.createPool({
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database
});

/**
 * @description promise-based version of `pool.query` method
 *
 * @param {string} params.query – sql string with ? as placeholders for params
 * @param {Array} params.params – params to replace in sql string
 * @returns {Promise<Object[]>}
 */
const query = ({ query: sqlQuery, params }) =>
  new Promise((resolve, reject) => {
    pool.query(sqlQuery, params, (error, results) => {
      if (error) {
        return reject(error);
      }

      resolve(results);
    });
  });

/**
 * @description query single object
 *
 * @param {Object} params – params to pass into usual `query` option
 * @returns {Promise<Object?>} – single item object/undefined if none was found
 */
const queryOne = async params => {
  const results = await query(params);

  return results[0];
};

/**
 * @description get total number of rows for given sql query. It supposes that
 * you use `COUNT(*) AS total` alias, otherwise you need to pass property name
 *
 * @param {string} params.query – sql string with ? as placeholders for params
 * @param {Array} params.params – params to replace in sql string
 * @param {string} params.property – alias for number of rows in sql query.
 *   by default its value is `total`
 * @returns {Promise<number>}
 */
const count = async ({ query: sqlQuery, params, property = "total" }) => {
  const result = await query({ query: sqlQuery, params });

  return result[0][property];
};

module.exports = {
  pool,
  count,
  query,
  queryOne
};
