const invite = require("../models/invite");
const organization = require("../models/organization");
const { isEmail, ReE, isNull, ReS, to } = require("../services/util.service");
const { IsValidUUIDV4 } = require("../services/validation");
const httpStatus = require("http-status").status;

exports.sendInviteLink = async (req, res) => {

    let err, user = req.user, body = req.body;
    let fields = ["userIds", "org_id"]
    let inVaildFields = fields.filter(x => isNull(body[x]));

    if (inVaildFields.length > 0) {
        return ReE(res, { message: `please provide required fields ${inVaildFields}` }, httpStatus.BAD_REQUEST);
    }

    let { email, org_id } = body;

    if (!Array.isArray(email)) {
        return ReE(res, { message: `email must be an array` }, httpStatus.BAD_REQUEST);
    }

    if (email.length == 0) {
        return ReE(res, { message: `email must not be empty` }, httpStatus.BAD_REQUEST);
    }

    let userDetail = []

    for (let i = 0; i < email.length; i++) {
        let id = email[i]
        if (!isEmail(id)) {
            return ReE(res, { message: `email id:(${id}) is invalid` }, httpStatus.BAD_REQUEST);
        }
        email = email.toLowerCase();
        let checkUser
        [err, checkUser] = await to(user_data.findOne({ where: { email } }));
        if (err) {
            return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!checkUser) {
            let createUser;
            [err, createUser] = await to(user_data.create({ email }));
            if (err) {
                return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
            }
            userDetail.push(createUser)
        }else{
            userDetail.push(checkUser)
        }
    }

    if (!IsValidUUIDV4(org_id)) {
        return ReE(res, { message: "org_id must be a valid id" }, httpStatus.BAD_REQUEST);
    }

    let org;
    [err, org] = await to(organization.findOne({ where: { _id: org_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!org) return ReE(res, { message: "Organization not found" }, httpStatus.NOT_FOUND);

    if (org.admin_id.toString() !== user._id.toString()) {
        return ReE(res, { message: "You are not the admin of this organization" }, httpStatus.UNAUTHORIZED);
    }

    var invitePromises = userDetail?.map(async function (user) {
        var token = jwt.sign({ userId: user._id, org_id: org._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        var domain = process.env.FE_ACC_URL || "http://localhost:3000/accept";
        var inviteLink = domain + "?token=" + token;
        let createInvite;
        [err, createInvite] = await to(invite.create({
            userId: user._id,
            OrganizationId: org._id,
            token: token,
            email: user.email,
            status: "pending"
        }))
        return mailer.sendInviteEmail(user.email, inviteLink, user.name + " invitate to join " + org.name)
            .then(function () { return { email: user, status: "sent" }; })
            .catch(function (err) { return { email: user, status: "failed", error: err.message }; });
    });

    var results = await Promise.all(invitePromises);

    ReS(res, { message: "Invites sent", results: results }, httpStatus.OK);

}

exports.acceptInvite = async (req, res) => {
    let err, token = req.token;
    let { userId, org_id } = token;

    let checkUser;
    [err, checkUser] = await to(user_data.findOne({ where: { _id: userId } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) return ReE(res, { message: "User not found" }, httpStatus.NOT_FOUND);

    let org;
    [err, org] = await to(organization.findOne({ where: { _id: org_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!org) return ReE(res, { message: "Organization not found" }, httpStatus.NOT_FOUND);

    let inviteUpdate;
    [err, inviteUpdate] = await to(invite.update({ status: "accepted" }, { where: { userId: userId, OrganizationId: org_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!inviteUpdate) return ReE(res, {message: "Invite not found"}, httpStatus.INTERNAL_SERVER_ERROR);

    let userOrgUpdate;
    [err, userOrgUpdate] = await to(user.update({ organization_ids: [...org.organization_ids, org_id] }, { where: { _id: userId } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    ReS(res, { message: "Invite accepted", data: token }, httpStatus.OK);

}