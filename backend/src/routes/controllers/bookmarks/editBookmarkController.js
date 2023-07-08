module.exports = async (req, res) => {
  console.log("bookmark edit", req.body);
  console.log("bookmark edit title", req.body.title);
  return res.status(200).json({ msg: "bookmark edited" });
}
