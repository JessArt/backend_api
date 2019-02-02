const { get } = require("./get");
const { post } = require("./post");
const { put } = require("./put");
const { upload, uploadGIF } = require("./upload");
const { getMany } = require("./getMany");
const { remove } = require("./delete");

module.exports.get = get;
module.exports.post = post;
module.exports.put = put;
module.exports.getMany = getMany;
module.exports.upload = upload;
module.exports.uploadGIF = uploadGIF;
module.exports.remove = remove;
