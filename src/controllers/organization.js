const { to, isNull, ReE, ReS } = require("../services/util.service");
const db = require("../models");
const user_data = db.user_data;
const organization = db.organization;
const httpStatus = require("http-status").status;
const { Sequelize } = require("sequelize");
const { IsValidUUIDV4 } = require("../services/validation");

// CREATE organization
exports.createOrganization = async (req, res) => {
    let err, body = req.body, user = req.user;
    let fields = ["name", "logo_url"];
    let invalidFields = fields.filter(x => isNull(body[x]));

    if (invalidFields.length > 0) {
        return ReE(res, { message: `please provide required fields ${invalidFields}` }, httpStatus.BAD_REQUEST);
    }

    let { name, email, logo_url} = body;

    let admin_id = user._id;

    if (!IsValidUUIDV4(admin_id)) {
        return ReE(res, { message: "admin_id must be a valid id" }, httpStatus.BAD_REQUEST);
    }

    let adminUser;
    [err, adminUser] = await to(user_data.findOne({ where: { _id: admin_id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!adminUser) return ReE(res, { message: "admin_id does not exist" }, httpStatus.BAD_REQUEST);

    // Check if name already exists
    let existingOrg;
    name = name.trim().toLowerCase();
    [err, existingOrg] = await to(organization.findOne({ where: { name } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (existingOrg) return ReE(res, { message: "Organization name already exists" }, httpStatus.BAD_REQUEST);

    let org;
    [err, org] = await to(
        organization.create({ name, email, logo_url, admin_id })
    );

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    let updateOrgUser;
    [err, updateOrgUser] = await to(
        user_data.update({ organization_ids: [...user.organization_ids, org._id] }, { where: { _id: user._id } })
    );
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    ReS(res, { message: "Organization created successfully", organization: org }, httpStatus.OK);

};

// UPDATE organization
exports.updateOrganization = async (req, res) => {
    let err, body = req.body;
    let orgId = req.params.id;

    // Check if name is being updated and already exists in another record
    if (body.name) {
        let existingOrg;
        [err, existingOrg] = await to(organization.findOne({ where: { name: body.name, _id: { [db.Sequelize.Op.ne]: orgId } } }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (existingOrg) return ReE(res, { message: "Organization name already exists" }, httpStatus.BAD_REQUEST);
    }

    let [updateErr, updated] = await to(
        organization.update(body, { where: { _id: orgId }, returning: true })
    );
    if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR);
    if (!updated[0]) return ReE(res, { message: "Organization not found" }, httpStatus.NOT_FOUND);

    ReS(res, { message: "Organization updated successfully", organization: updated[1][0] }, httpStatus.OK);
};

// GET all organizations
exports.getAllOrganizations = async (req, res) => {
    let err, orgs;
    [err, orgs] = await to(
        organization.findAll({
            include: [
                { model: db.user_data, as: "admin", attributes: ["_id", "name", "email"] }
            ]
        })
    );
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    ReS(res, { data: orgs }, httpStatus.OK);
};

// GET organization by ID
exports.getOrganizationById = async (req, res) => {
    let err, org;
    let orgId = req.params.id;

    [err, org] = await to(
        organization.findOne({
            where: { _id: orgId },
            include: [
                { model: db.user_data, as: "admin", attributes: ["_id", "name", "email"] }
            ]
        })
    );
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!org) return ReE(res, { message: "Organization not found" }, httpStatus.NOT_FOUND);

    ReS(res, { data: org }, httpStatus.OK);
};

// DELETE organization
exports.deleteOrganization = async (req, res) => {
    let err, orgId = req.params.id;

    let deleted;
    [err, deleted] = await to(organization.destroy({ where: { _id: orgId } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!deleted) return ReE(res, { message: "Organization not found" }, httpStatus.NOT_FOUND);

    ReS(res, { message: "Organization deleted successfully" }, httpStatus.OK);
};
