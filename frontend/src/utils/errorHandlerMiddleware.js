// next is required but not used hence _next, see: https://stackoverflow.com/a/61464426/5671836
module.exports = async (err, req, res, _next) => {
  res.status(err.status ?? 500).send({ error: err.message });
};
