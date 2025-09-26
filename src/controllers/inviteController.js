const db = require("../models");
const jwt = require("jsonwebtoken");
const organization = db.organization;
const user_data = db.user_data;
const invite = db.invite;
const { isEmail, ReE, isNull, ReS, to } = require("../services/util.service");
const { IsValidUUIDV4 } = require("../services/validation");
const {sendInviteEmail} = require("../services/inviteMailer");

const httpStatus = require("http-status").status;

exports.sendInviteLink = async (req, res) => {

    let err, user = req.user, body = req.body;
    let fields = ["email", "org_id"]
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

    if (!IsValidUUIDV4(org_id)) {
        return ReE(res, { message: "org_id must be a valid id" }, httpStatus.BAD_REQUEST);
    }

    let org;
    [err, org] = await to(organization.findOne({ where: { id: org_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!org) return ReE(res, { message: "Organization not found" }, httpStatus.NOT_FOUND);

    if (org.admin_id.toString() !== user.id.toString()) {
        return ReE(res, { message: "You are not the admin of this organization" }, httpStatus.UNAUTHORIZED);
    }

    let userDetail = []

    for (let i = 0; i < email.length; i++) {
        let id = email[i]
        if (!isEmail(id)) {
            return ReE(res, { message: `email id:(${id}) is invalid` }, httpStatus.BAD_REQUEST);
        }        
        id = id.toLowerCase();
        let checkUser
        [err, checkUser] = await to(user_data.findOne({ where: { email: id } }));
        if (err) {
            return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!checkUser) {
            let createUser;
            [err, createUser] = await to(user_data.create({ email:id }));
            if (err) {
                return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
            }
            userDetail.push(createUser)
        } else {
            userDetail.push(checkUser)
            //let check invite already send or not
            let checkInvite;
            [err, checkInvite] = await to(invite.findOne({ where: { userId: checkUser.id, OrganizationId: org_id } }));
            if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
            //check expiry
            if (checkInvite && checkInvite?.expiry < new Date()) {
                //delete invite
                [err, checkInvite] = await to(invite.destroy({ where: { userId: checkUser.id, OrganizationId: org_id } }));
                if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
            }else if (checkInvite) {
                return ReE(res, { message: "Invite already sent to this email:" + id }, httpStatus.BAD_REQUEST)
            }
        }
    }

    var invitePromises = userDetail?.map(async function (user) {
        var token = jwt.sign({ userId: user.id, org_id: org.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        var domain = process.env.FE_ACC_URL || "http://localhost:3000/accept";
        var inviteLink = domain + "?token=" + token;

        let checkInvite;
        [err, checkInvite] = await to(invite.findOne({ where: { userId: user.id, OrganizationId: org.id } }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!checkInvite){
            
        }
        let createInvite;
        //set expiry as 7 days
        let exp = new Date();
        
        exp.setDate(exp.getDate() + 7);
        
        [err, createInvite] = await to(invite.create({
            userId: user.id,
            OrganizationId: org.id,
            email: user.email,
            expiry: exp,
            status: "pending"
        }))
        if (err) {
            return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        }
        return sendInviteEmail(user.email, inviteLink, user.name + " invitate to join " + org.name)
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
    [err, checkUser] = await to(user_data.findOne({ where: { id: userId } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) return ReE(res, { message: "User not found" }, httpStatus.NOT_FOUND);

    let org;
    [err, org] = await to(organization.findOne({ where: { id: org_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!org) return ReE(res, { message: "Organization not found" }, httpStatus.NOT_FOUND);

    let getInvite;
    [err, getInvite] = await to(invite.findOne({ where: { userId: userId, OrganizationId: org_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getInvite) return ReE(res, { message: "Invite not found" }, httpStatus.BAD_REQUEST);

    //check expiry
    if (getInvite.expiry < new Date()) {
        return ReE(res, { message: "Invite expired contact admin to re-send the invite" }, httpStatus.BAD_REQUEST);
    }

    if(getInvite.status === "accepted") {
        return ReE(res, { message: "Invite already accepted" }, httpStatus.BAD_REQUEST);
    }

    let inviteUpdate;
    [err, inviteUpdate] = await to(invite.update({ status: "accepted" }, { where: { userId: userId, OrganizationId: org_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!inviteUpdate) return ReE(res, { message: "Invite not found" }, httpStatus.INTERNAL_SERVER_ERROR);

    let updateOrg = [...checkUser.organization_ids, org_id]
    updateOrg = [...new Set(updateOrg)];

    let userOrgUpdate;
    [err, userOrgUpdate] = await to(user_data.update({ organization_ids: updateOrg }, { where: { id: userId } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    let createUsrOrg;
    [err, createUsrOrg] = await to(db.user_organization.create({
        organization_id: org.id,
        user_id: checkUser.id,
        admin: false
    }))

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    ReS(res, { message: "Invite accepted", data: token }, httpStatus.OK);

}