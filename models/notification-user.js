"use strict";

module.exports = (sequelize, DataTypes) => {
  let NotificationUser = sequelize.define(
    "NotificationUser",
    {
      read: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      timestamps: false,
    }
  );

  return NotificationUser;
};
