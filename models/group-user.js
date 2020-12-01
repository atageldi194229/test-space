"use strict";

module.exports = (sequelize, DataTypes) => {
  let GroupUser = sequelize.define(
    "GroupUser",
    {},
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: false,
      underscored: true,
    }
  );
  GroupUser.associate = function (models) {
    // associations there
    // GroupUser.belongsTo(models.Group, { foreignKey: "groupId" });
  };
  return GroupUser;
};
