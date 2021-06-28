"use strict";

// const { Mailer } = require("../services");
// const notificationContents = require("../config/notifications.json");

const model = (sequelize, DataTypes) => {
  let Notification = sequelize.define(
    "Notification",
    {
      type: {
        type: DataTypes.STRING,
        defaultValue: "info",
        comment:
          "Notification type (payment-allowed, payment-cancelled, test-allowed, test-cancelled, invitation, success, info, warning, danger)",
      },
      payload: { type: DataTypes.TEXT, comment: "json object" },
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

  Notification.send = async function (userIds, { type, payload }) {
    // convert userIds to array if is not
    if (!Array.isArray(userIds)) userIds = [userIds];

    // get all users with their emails
    let users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "email", "language"],
    });

    // filtering userIds
    userIds = users.map((e) => e.id);

    // request db
    let notification = await Notification.create({ type, payload: JSON.stringify(payload) });

    // connect notification with users
    await NotificationUser.bulkCreate(
      userIds.map((userId) => ({ userId, notificationId: notification.id }))
    );

    return notification;
  };

  Notification._send = async function (
    userIds,
    { action, data, type, title, content }
  ) {
    // convert userIds to array if is not
    if (!Array.isArray(userIds)) userIds = [userIds];

    // get all users with their emails
    let users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "email", "language"],
    });

    // filtering userIds
    userIds = users.map((e) => e.id);

    // prepare data
    if (action) {
      const sendLangNotif = async (lang) => {
        let langUsers = users.filter((e) => e.language === lang);

        if (!langUsers.length) return;

        let payload = notificationContents[lang][action];

        for (let i in data) {
          payload.content = payload.content.replace(`*${i}*`, data[i]);
        }

        let notification = await Notification.create(payload);

        await NotificationUser.bulkCreate(
          langUsers.map((user) => ({
            userId: user.id,
            notificationId: notification.id,
          }))
        );
        // await Mailer.sendMail({
        //   to: langUsers.map((e) => e.email),
        //   subject: payload.title,
        //   text: payload.content,
        // });
      };

      await sendLangNotif("tm");
      await sendLangNotif("ru");
      await sendLangNotif("en");

      return {};
    } else {
      // request db
      let notification = await Notification.create({ type, title, content });

      // connect notification with users
      await NotificationUser.bulkCreate(
        userIds.map((userId) => ({ userId, notificationId: notification.id }))
      );

      // get all emails
      let emails = users.map((e) => e.email);

      // await Mailer.sendMail({ to: emails, subject: title, text: content });

      return { notification, users };
    }
  };
};

module.exports = { model, methods };
