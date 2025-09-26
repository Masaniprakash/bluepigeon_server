
const jwt = require("jsonwebtoken");

module.exports = async function verifyInviteToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const secretKey = process.env.JWT_SECRET;
  jwt.verify(token, secretKey, async (err, verfied) => {
    if (err) {
      return res.status(403).send({ success: false, error: err.message });
    }
    req.token = verfied;
    next();
  })
}