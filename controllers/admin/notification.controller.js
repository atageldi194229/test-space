"use strict";

const {
  Notification,
  NotificationUser,
  User,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
// const { Mailer } = require("../../services");
const obj = {};

/**
 * send notification
 * action - /admin/notifications
 * method - post
 * token
 */
obj.send = async (req, res, next) => {
  // client data
  let { userIds, type, title, content } = req.body;

  // prepare data
  let users = await User.findAll({
    where: { id: userIds },
    attributes: ["id", "email"],
  });

  // create notification
  await Notification.send(
    users.map((user) => user.id),
    {
      type: type || "info",
      payload: { title, content },
    }
  );

  // send notification to users mails
  // await Mailer.sendMail({
  //   to: users.map((user) => user.email),
  //   subject: title,
  //   text: content,
  // });

  // client response
  res.status(200).json({
    success: true,
  });
};

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = [];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
