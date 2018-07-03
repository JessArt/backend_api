const { get } = require("./get");
const { post } = require("./post");
const { put } = require("./put");
const { upload } = require("./upload");
const { getMany } = require("./getMany");

module.exports.get = get;
module.exports.post = post;
module.exports.put = put;
module.exports.getMany = getMany;
module.exports.upload = upload;
