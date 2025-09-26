const { to } = require("await-to-js");
const { isNull, ReE, isEmail, ReS } = require("../services/util.service");
const { sendOtp } = require("../services/mailer");
const db = require("../models");
const jwt = require("jsonwebtoken");
const user_data = db.user_data;
const httpStatus = require("http-status").status;
const axios = require('axios');
// const jwt = require('jsonwebtoken');
const { oauth2Client } = require('../services/googleClient');
const organization = require("../models/organization");
const { IsValidUUIDV4 } = require("../services/validation");

exports.sendOtpToEmail = async (req, res) => {

  let err, user = req.user, body = req.body;
  let fields = ["email"]
  let inVaildFields = fields.filter(x => isNull(body[x]));

  if (inVaildFields.length > 0) {
    return ReE(res, { message: `please provide required fields ${inVaildFields}` }, httpStatus.BAD_REQUEST);
  }

  let { email } = body;

  if (!isEmail(email)) {
    return ReE(res, { message: `please enter valid email` }, httpStatus.BAD_REQUEST);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  email = email.toLowerCase();
  let checkUser
  [err, checkUser] = await to(user_data.findOne({ where: { email } }));
  if (err) {
    return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  }
  if (!checkUser) {
    let createUser;
    [err, createUser] = await to(user_data.create({ email, otp, otpExpiresAt: expiresAt }));
    if (err) {
      console.log(err);

      return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    }
  } else {
    let updateUser
    [err, updateUser] = await to(user_data.update({ otp, otpExpiresAt: expiresAt }, { where: { email } }));
    if (err) {
      return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  let otpEmail;
  [err, otpEmail] = await to(sendOtp(email, otp));
  if (err) {
    return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  }

  ReS(res, { message: "otp send succesfully" }, httpStatus.OK);

}

exports.verifyOtp = async (req, res) => {

  let err, user = req.user, body = req.body;
  let fields = ["otp", "email"]
  let inVaildFields = fields.filter(x => isNull(body[x]));

  if (inVaildFields.length > 0) {
    return ReE(res, { message: `please provide required fields ${inVaildFields}` }, httpStatus.BAD_REQUEST);
  }

  let { otp, email } = body;

  if (!isEmail(email)) {
    return ReE(res, { message: `please enter valid email` }, httpStatus.BAD_REQUEST);
  }

  if (otp.length !== 6) {
    return ReE(res, { message: `please enter valid otp` }, httpStatus.BAD_REQUEST);
  }

  let checkUser
  [err, checkUser] = await to(user_data.findOne({ where: { email } }));
  if (err) {
    return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!checkUser) {
    return ReE(res, { message: "user not found" }, httpStatus.BAD_REQUEST);
  }

  if (checkUser.otp !== otp) {
    return ReE(res, { message: "invalid otp" }, httpStatus.BAD_REQUEST);
  }

  if (checkUser.otpExpiresAt < new Date()) {
    return ReE(res, { message: "otp expired" }, httpStatus.BAD_REQUEST);
  }

  let updateUser
  [err, updateUser] = await to(user_data.update({ otp: null, otpExpiresAt: null }, { where: { email } }));
  if (err) {
    return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  }

  //jwt token send
  let token = jwt.sign({ userId: checkUser.id }, process.env.JWT_SECRET)

  ReS(res, { message: "otp verified successfully", token }, httpStatus.OK);

}

exports.googleAuth = async (req, res, next) => {
  const code = req.query.code;
  try {
    if (!code) {
      return ReE(res, { message: "google code not found" }, httpStatus.BAD_REQUEST);
    }
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    let { email, name, picture } = userRes.data;
    email = email.toLowerCase();
    let user = await user_data.findOne({ where: { email: email } });
    if (!user) {
      user = await user_data.create({
        name,
        email,
        image_url: picture,
        google_id: userRes?.data?.id
      });
    }
    if(!user.google_id){
      let update, err;
      [err, update] = await to(user_data.update(
        {google_id:userRes?.data?.id, image_url: picture},
        {where: {email:email}}
      ));
      if (err) {
        return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    const { id } = user;
    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET);
    ReS(res, { message: "Google login successfully", token }, httpStatus.OK);
  } catch (err) {
    ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  }
};

exports.getAllUser = async (req, res) => {

  let err;
  let getAllUsers;
  [err, getAllUsers] = await to(db.user_data.findAll({
    include: [
      {
        model: db.organization,   // ✅ model must be the actual object
        as: "organizations",      // ✅ alias must match association
      },
    ],
  }))

  if (err) {
    return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  }

  ReS(res, { message: "get all user successfully", data: getAllUsers }, httpStatus.OK);

}

exports.updateUserDeatils = async (req, res, next) => {
  const userId = req.user.id;

   let err, user = req.user, body = req.body;
  let fields = ["firstName", "lastName", "job_title"]
  let inVaildFields = fields.filter(x => isNull(body[x]));

  if (inVaildFields.length > 0) {
    return ReE(res, { message: `please provide required fields ${inVaildFields}` }, httpStatus.BAD_REQUEST);
  }

  // let fields = ["firstName", "lastName", "job_title"];
  // let inVaildFields = fields.filter(x => isNull(req.body[x]));
  // if (inVaildFields.length > 0) {
  //   return ReE(res, { message: `please provide required fields ${inVaildFields}` }, httpStatus.BAD_REQUEST);
  // }
  let { firstName, lastName, job_title } = req.body;
  try {
    await user_data.update({ name: firstName + " " + lastName, job_title }, { where: { id: userId } });
    res.send({ success: true, message: "user details updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
}

exports.generateToken = async (req, res, next) => {
  const userId = req.body.userId;
  if(!userId){
    return ReE(res, { message: "userId is required" }, httpStatus.BAD_REQUEST);
  }
  if (!IsValidUUIDV4(userId)) {
      return ReE(res, { message: "userId must be a valid id" }, httpStatus.BAD_REQUEST);
  }
  let checkUser
  [err, checkUser] = await to(user_data.findOne({ where: { id: userId } }));
  if (err) {
    return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  }
  if (!checkUser) {
    return ReE(res, { message: "user not found given user id" }, httpStatus.BAD_REQUEST);
  } 
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  ReS(res, { message: "token generated successfully", token }, httpStatus.OK);
}