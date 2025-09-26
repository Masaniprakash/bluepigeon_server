// src/models/user_organization.js
module.exports = (sequelize, DataTypes) => {
  const user_organization = sequelize.define(
    "user_organization",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "user_data",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "organization",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      admin:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      timestamps: true,
    }
  );

  user_organization.associate = function (models) {
    user_organization.belongsTo(models.user_data, { foreignKey: 'user_id', as: 'user' });
    user_organization.belongsTo(models.organization, { foreignKey: 'organization_id', as: 'organization' });
  };

  return user_organization;
};
