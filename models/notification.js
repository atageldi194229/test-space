"use strict";

module.exports = (sequelize, DataTypes) => {
  let Notification = sequelize.define(
    "Notification",
    {
      type: {
        type: DataTypes.ENUM,
        values: ["success", "info", "warning", "danger"],
        defaultValue: "info",
        allowNull: false,
        comment: "Notification type (success, info, warning, danger)",
      },
      content: { type: DataTypes.TEXT },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  Notification.associate = function (models) {
    // associations there

    Notification.belongsToMany(models.User, {
      through: { model: "NotificationUser" },
    });
  };

  return Notification;
};
