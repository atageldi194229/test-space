"use strict";

const {
  User,
  Group,
  GroupUser,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

/**
 * get groups,
 * action - /v1/groups,
 * method - get,
 * token,
 */
obj.getAll = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  // request db
  let groups = await Group.findAll({
    where: { userId: req.user.id },
    attributes: ["id", "name", "description"],
  });

  // client response
  res.status(200).json({
    success: true,
    groups,
  });
};

/**
 * get one by id group,
 * action - /v1/groups/:id,
 * method - get,
 * token,
 */
obj.getOne = async (req, res, next) => {
  // client data
  let { id } = req.params;

  // request db
  let group = await Group.findOne({
    where: { id, userId: req.user.id },
    attributes: ["id", "name", "description"],
    include: [
      {
        association: "Users",
        attributes: ["username"],
      },
    ],
  });

  // error test
  if (!group) return next(new ErrorResponse("Group is not found"));

  // prepare data
  let resData = {
    id: group.id,
    name: group.name,
    description: group.description,
    users: group.Users,
  };

  // client response
  res.status(200).json({
    success: true,
    group: resData,
  });
};

/**
 * Create group,
 * action - /v1/groups,
 * method - post,
 * token,
 */
obj.create = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  // client data
  let { name, description } = req.body;

  // request db
  let group = await Group.create({ name, description, userId: req.user.id });

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Edit group name or description,
 * action - /v1/groups/:id,
 * method - put,
 * token,
 */
obj.update = async (req, res, next) => {
  // client data
  let {
    params: { id },
    body: { name, description },
  } = req;

  // request db
  let updatedRows = await Group.update(
    { name, description },
    { where: { id, userId: req.user.id } }
  );

  // error test
  if (Number.isInteger(updatedRows) && updatedRows === 0)
    return next(new ErrorResponse("Row is not updated"));

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Delete group,
 * action - /v1/groups/:id,
 * method - delete,
 * token,
 */
obj.destroy = async (req, res, next) => {
  // client data
  let id = req.params.id,
    userId = req.user.id;

  // request db
  let updatedRows = await Group.destroy({ where: { id, userId } });

  // error test
  if (Number.isInteger(updatedRows) && updatedRows === 0)
    return next(new ErrorResponse("Row is not updated"));

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Add user to the group,
 * action - /v1/groups/:id/user,
 * method - post,
 * token,
 */
obj.addUser = async (req, res, next) => {
  // client data
  let {
    params: { id },
    body: { userId },
  } = req;

  // request db
  let group = await Group.findOne({ where: { id, userId: req.user.id } });

  // error test
  if (!group) return next(new ErrorResponse("Group is not found"));

  let updatedRows = await GroupUser.create({
    groupId: group.id,
    userId,
  });

  // error test
  if (Number.isInteger(updatedRows) && updatedRows === 0)
    return next(new ErrorResponse("Row is not updated"));

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Remove user to the group,
 * action - /v1/groups/:id/user,
 * method - delete,
 * token,
 */
obj.removeUser = async (req, res, next) => {
  // client data
  let {
    params: { id },
    body: { userId },
  } = req;

  // log for experiment
  console.log(req.body, req.user);

  // request db
  let group = await Group.findOne({ where: { id, userId: req.user.id } });

  // error test
  if (!group) return next(new ErrorResponse("Group is not found"));

  let updatedRows = await GroupUser.destroy({
    groupId: group.id,
    userId,
  });

  // error test
  if (Number.isInteger(updatedRows) && updatedRows === 0)
    return next(new ErrorResponse("Row is not updated"));

  // client response
  res.status(200).json({
    success: true,
  });
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
