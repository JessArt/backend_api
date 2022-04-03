const { queryOne, query } = require("./db/connection");

module.exports.request = async (req, res) => {
  const { login, password } = req.body;

  const result = await queryOne({
    query: "SELECT * FROM users WHERE login = ? AND password = ?",
    params: [login, password]
  });

  if (result) {
    const token = createNewHash();
    await queryOne({
      query: "INSERT INTO sessions (id) VALUES(?)",
      params: [token]
    });

    res.json({
      token
    });
  } else {
    res.status(401).json({
      error: "incorrent_login_data"
    });
  }
};

module.exports.validateToken = async (req, res) => {
  validateToken({ req, res, cb: () => res.json({ status: "success" }) });
};

module.exports.middleware = async (req, res, next) => {
  validateToken({ req, res, cb: next });
};

async function validateToken({ req, res, cb }) {
  const { token } = req.query;

  if (!token) {
    res.status(401).send({
      error: "Unauthorized"
    });

    return;
  }

  const result = await queryOne({
    query: "SELECT * FROM sessions WHERE id = ?",
    params: [token]
  });

  if (!result) {
    res.status(401).send({
      error: "Unauthorized"
    });

    return;
  } else {
    // keep token valid for 7 days
    if (Date.now() - result.date > 1000 * 60 * 60 * 24 * 7) {
      // tokens should be removed by cron, not here, since we
      // will omit some of them
      res.status(401).send({
        error: "Unauthorized"
      });

      return;
    } else {
      // every time we check token and it is valid, we should prolong it
      // so you are not kicked out automatically all the time
      // we also don't want to wait for it, we are totally fine to update
      // it in the background
      query({
        query: "UPDATE sessions SET date = NOW() WHERE id = ?",
        params: [token]
      });
      cb();
    }
  }
}

const LETTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

const NUM = LETTERS.length;

function createNewHash() {
  const result = [];
  for (let i = 0; i < 16; i++) {
    const index = Math.floor(Math.random() * NUM);
    result.push(LETTERS[index]);
  }

  return result.join("");
}
