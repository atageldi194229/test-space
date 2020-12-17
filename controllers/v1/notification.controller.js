"use strict";

const {
  User,
  Notification,
  NotificationUser,
  sequelize,
  Payment,
  GroupUser,
  Group,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const notificationUser = require("../../models/notification-user");
const { Mailer } = require("../../services");
const obj = {};

/**
 * Send test invitation to the users
 * action - /v1/notifications/send-invitation
 * method - post
 * token
 */
obj.sendInvitation = async (req, res, next) => {
  // get from client
  let { userIds, groupIds, testId } = req.body;

  // validate data
  userIds = userIds || [];
  groupIds = groupIds || [];
  if (!Array.isArray(userIds) || !Array.isArray(groupIds))
    return next(new ErrorResponse("Validation error"));

  // check if client can send invitaition
  let data = await Payment.canSendInvitation(req.user.id, {
    userIds,
    groupIds,
  });

  // error test
  if (!data.canSend)
    return next(new ErrorResponse("Could not send invitation"));

  // request db (set used to payment tsc)
  let isTscUsed = await Payment.useTsc(req.user.id, {
    tscCount: data.tsc.need,
    payments: data.payments,
  });

  // error test
  if (!isTscUsed)
    return next(new ErrorResponse("Error when using tsc from payment"));

  // send invitation start
  // via notification
  let notification = await Notification.create({
    content: `You invited to test with id ${testId}`,
  });
  let updatedRows = await NotificationUser.bulkCreate(
    data.userIds.map((userId) => ({
      userId,
      notificationId: notification.id,
    }))
  );
  // via mail
  let to = (
    await User.findAll({
      where: { id: data.userIds },
      attributes: ["email"],
    })
  ).map((e) => e.email);
  await Mailer.sendTestInvitation({ to, testId, userId: req.user.id }).catch(
    console.log
  );
  // send invitation end

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

/**
 * set read to the notification
 * action - /v1/notifications/:id/read
 * method - post
 * token
 */
obj.setRead = async (req, res, next) => {
  // client data
  let notificationId = req.params.id,
    userId = req.user.id;

  // request db
  await Notification.setRead(userId, notificationId);

  // cliect response
  res.status(200).json({
    success: true,
  });
};

/**
 * get unread notifiactions
 * action - /v1/notifications/unread
 * method - get
 * token
 */
obj.getUnread = async (req, res, next) => {
  // client data
  let userId = req.user.id;

  // request db
  let ids = (
    await NotificationUser.findAll({
      where: { userId, read: false },
      attributes: ["notificationId"],
    })
  ).map((e) => e.notificationId);
  let notifications = await Notification.findAll({
    where: { id: ids },
    order: [["createdAt", "asc"]],
  });

  // prepare data
  notifications = notifications.map((e) => ({
    id: e.id,
    type: e.type,
    content: e.content,
    createdAt: e.createdAt,
  }));

  // client response
  res.status(200).json({
    success: true,
    notifications,
  });
};

/**
 * get all notifiactions
 * action - /v1/notifications
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
  // client data
  let userId = req.user.id,
    { limit, offset } = req.query;

  // validate data
  limit = limit || 20;
  offset = offset || 0;

  // request db
  let data = await NotificationUser.findAll({
    limit,
    offset,
    where: { userId },
    attributes: ["notificationId", "read"],
  });
  let notifications = await Notification.findAll({
    where: { id: data.map((e) => e.notificationId) },
    order: [["createdAt", "desc"]],
  });

  // prepare data
  let read = {};
  data.forEach((e) => (read[e.notificationId] = e.read));
  notifications = notifications.map((e) => ({
    id: e.id,
    read: read[e.id],
    type: e.type,
    content: e.content,
    createdAt: e.createdAt,
  }));

  // client response
  res.status(200).json({
    success: true,
    notifications,
  });

  // request db (set read to those notifications)
  await Notification.setRead(
    userId,
    data.filter((e) => !e.read).map((e) => e.notificationId)
  );
};

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = ["status"];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
