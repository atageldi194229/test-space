"use strict";

module.exports = (sequelize, DataTypes) => {
  let Group = sequelize.define(
    "Group",
    {
      name: {
        type: DataTypes.STRING,
        defaultValue: "New Group",
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      timestamps: false,
      underscored: true,
    }
  );
  Group.associate = function (models) {
    // associations there

    Group.belongsTo(models.User, { foreignKey: "userId" });
    Group.belongsToMany(models.User, {
      through: "GroupUser",
      foreignKey: "groupId",
    });
  };

  return Group;
};
