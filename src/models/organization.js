const { TE, to, isNull } = require('../services/util.service');

module.exports = (sequelize, DataTypes) => {
  const organization = sequelize.define('organization', {
    _id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdby: {
      type: DataTypes.UUID,
    },
    updatedby: {
      type: DataTypes.UUID,
    },
    admin_id: {           
      type: DataTypes.UUID,
      allowNull: true,
    },
    parent_org_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    createddate: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updateddate: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
  });

  organization.associate = function (models) {
    // Parent-child organizations
    organization.hasMany(models.organization, { foreignKey: 'parent_org_id', as: 'subOrganizations' });
    organization.belongsTo(models.organization, { foreignKey: 'parent_org_id', as: 'parentOrganization' });

    // Users in the organization
    organization.hasMany(models.user_data, { foreignKey: 'organization_id', as: 'users' });

    // Organization has many invites
    organization.hasMany(models.invite, { foreignKey: 'OrganizationId', as: 'invites' });

    // Optional single admin user
    organization.belongsTo(models.user_data, { foreignKey: 'admin_id', as: 'admin' });
  };

  return organization;
};
