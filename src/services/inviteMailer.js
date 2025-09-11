var nodemailer = require("nodemailer");

function sendInviteEmail(toEmail, inviteLink, subject, callback) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  var mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: subject || "Join Organization",
    text: "Click here to join: " + inviteLink
  };

  if (callback) {
    transporter.sendMail(mailOptions, callback);
  } else {
    // return a Promise if no callback
    return new Promise(function (resolve, reject) {
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) reject(err);
        else resolve(info);
      });
    });
  }
}

module.exports = {
  sendInviteEmail: sendInviteEmail
};
