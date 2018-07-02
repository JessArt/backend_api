// this is a simple function to wrap express' handlers
// it expects function to return a promise. The reason for it
// is to not to catch all errors manually, rather allow them to leak
// through and to be able to throw errors
// express will catch this error (since we explicitly call `next`)
// and display a proper error.
module.exports = fn => (req, res, next) => fn(req, res).catch(next);
