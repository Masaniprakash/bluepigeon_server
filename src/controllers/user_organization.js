const db = require("../models");
const { ReE, ReS, to } = require("../services/util.service");
const httpStatus = require("http-status").status;

exports.getAllOrgUser = async (req, res) => {
    
    let err;
    let getAllOrgUser;
    [err, getAllOrgUser] = await to(db.user_organization.findAll({
        includes: [
            {
                model: db.user_data,   // ✅ model must be the actual object
                as: "user",      // ✅ alias must match association
            },
            {
                model: db.organization,   // ✅ model must be the actual object
                as: "organization",      // ✅ alias must match association
            },
        ]
        
    }))

    if (err) {
      return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    }

    ReS(res, { message: "get all user successfully", data: getAllOrgUser }, httpStatus.OK);

}