const morgan = require("morgan");
const { createWriteStream } = require("fs");
const path = require("path");

const accessLogStream = createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a"
});

module.exports = function activateLogger(app) {
  const format =
    ":method :url [:date[web]] :status :res[content-length] - :response-time ms";
  app.use(morgan(format, { stream: accessLogStream }));
};
