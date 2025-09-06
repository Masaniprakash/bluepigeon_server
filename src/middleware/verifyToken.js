
const jwt = require("jsonwebtoken");
const { to } = require( "../services/util.service");
const db = require("../models");
const user_data = db.user_data;
const { IsValidUUIDV4 } = require("../services/validation");

module.exports = async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const secretKey = process.env.JWT_SECRET;
  jwt.verify(token, secretKey, async (err, verfied) => {
    if (err) {
      return res.status(403).send({ success: false, error: err.message });
    }
    let getUser, error;
    let typeJWT = verfied;
    if(!IsValidUUIDV4(typeJWT.userId)){
      return res.status(400).json({ success: false, error: 'token inside user id is not valid' });
    }
    [error, getUser] = await to(user_data.findOne({where:{ _id: typeJWT.userId }}))
    //delete the password
    delete getUser.password
    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!getUser) return res.status(401).json({ success: false, error: 'provide token User not found' });
    req.user = getUser;
    next();
  })
}