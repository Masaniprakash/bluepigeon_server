module.exports = (sequelize, DataTypes) => {
  const invite = sequelize.define("invite", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
    //   allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    OrganizationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
    //   allowNull: false
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted"),
      defaultValue: "pending"
    }
  });

  invite.associate = function (models) {
    // Invite belongs to one Organization
    invite.belongsTo(models.organization, {
      foreignKey: "OrganizationId",
      as: "organization"
    });

    // Invite belongs to one User (the invited user)
    invite.belongsTo(models.user_data, {
      foreignKey: "userId",
      as: "user"
    });
  };

  return invite;
};
