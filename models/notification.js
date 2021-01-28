"use strict";

const { Mailer } = require("../services");

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

const methods = ({ Notification, NotificationUser, User }) => {
  Notification.setRead = async function (userId, notificationId) {
    // request db
    return await NotificationUser.update(
      { read: true },
      { where: { userId, notificationId } }
    );
  };

  Notification.send = async function (userIds, { type, title, content }) {
    // convert userIds to array if is not
    if (!Array.isArray(userIds)) userIds = [userIds];

    // request db
    let notification = await Notification.create({ type, title, content });

    // get all users with their emails
    let users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "email"],
    });

    // filtering userIds
    userIds = users.map((e) => e.id);

    // connect notification with users
    let updatedRows = await NotificationUser.bulkCreate(
      userIds.map((userId) => ({ userId, notificationId: notification.id }))
    );

    // get all emails
    let emails = users.map((e) => e.email);

    await Mailer.sendMail({ to, subject: title, text: content });

    return { notification, users };
  };
};

module.exports = { model, methods };
