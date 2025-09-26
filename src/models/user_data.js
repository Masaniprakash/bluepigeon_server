const { TE, to, isNull } = require('../services/util.service');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const user_data = sequelize.define('user_data', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
    },
    google_id: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
    },
    userName: {
      type: DataTypes.STRING(100),
    },
    image_url: {
      type: DataTypes.STRING(100),
    },
    job_title: {
      type: DataTypes.STRING(100),
    },
    organization_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
    },
    otp: {
      type: DataTypes.STRING,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
    },
    password: {
      type: DataTypes.STRING(100),
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
    owner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createddate: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updateddate: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    }
  });

  user_data.associate = function (models) {
    // Self association: manager-subordinate
    user_data.hasMany(models.user_data, { foreignKey: 'parent_id', as: 'subordinates' });
    user_data.belongsTo(models.user_data, { foreignKey: 'parent_id', as: 'manager' });
    user_data.hasMany(models.invite, { foreignKey: 'userId', as: 'invites' });
    // user_data.belongsToMany(models.organization, {
    //   through: "user_organizations",
    //   foreignKey: "user_id",
    //   otherKey: "organization_id",
    //   as: "organizations"
    // });

  };

  return user_data;
};
