"use strict";

const model = (sequelize, DataTypes) => {
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
      title: { type: DataTypes.STRING },
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
      foreignKey: "notificationId",
    });
  };

  return Notification;
};

const methods = ({ Notification, NotificationUser }) => {
  Notification.setRead = async (userId, notificationId) => {
    // request db
    return await NotificationUser.update(
      { read: true },
      { where: { userId, notificationId } }
    );
  };
};

module.exports = { model, methods };
