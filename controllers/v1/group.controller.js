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
 * get all contacts,
 * action - /v1/groups/contacts,
 * method - get,
 * token,
 */
obj.getAllContacts = async (req, res) => {
  // client data
  let userId = req.user.id;

  // request db
  let groups = await Group.findAll({
    where: { userId },
    attributes: ["id", "name", "description"],
    include: [
      {
        association: "Users",
        attributes: {
          exclude: [
            "password",
            "updatedAt",
            "language",
            "gmt",
            "emailSubscribe",
            "isAdmin",
            "verifyCode",
            "status",
            "active",
          ],
        },
      },
    ],
  });
  /*
  let groupsMap = {};

  for (let i in groups) {
    groupsMap[groups[i].id] = groups[i];
  }

  let groupUsers = await GroupUser.findAll({
    where: { groupId: groups.map((e) => e.id) },
  });
  */

  // client response
  res.status(200).json({
    success: true,
    groups: groups.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      users: e.Users.map((ee) => ({
        id: ee.id,
        username: ee.username,
        image: ee.image,
        firstName: ee.firstNameA && ee.firstName,
        lastName: ee.lastNameA && ee.lastName,
        email: ee.emailA && ee.email,
        birthDate: ee.birthDateA && ee.birthDate,
        phoneNumber: ee.phoneNumberA && ee.phoneNumber,
        country: ee.countryA && ee.country,
        city: ee.cityA && ee.city,
        gender: ee.genderA && Number(ee.gender),
        job: ee.jobA && ee.job,
        bio: ee.bioA && ee.bio,
      })),
    })),
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
        attributes: ["id", "username"],
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
    // let's remove unneeded properties
    users: group.Users.map((e) => ({ id: e.id, username: e.username })),
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
    where: {
      groupId: group.id,
      userId,
    },
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
 * search groups by their name
 * action - /v1/groups/find
 * method - post
 * token
 */
obj.findGroups = async (req, res, next) => {
  // client data
  let text = (req.body.text || "").toLowerCase();

  // request db
  let groups = await Group.findAll({
    where: {
      name: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("Group.name")),
        "LIKE",
        "%" + text + "%"
      ),
      userId: req.user.id,
    },
    order: [[sequelize.fn("LENGTH", sequelize.col("Group.name")), "ASC"]],
    attributes: ["id", "name", "description"],
  });

  // prepare response data
  let data = [];

  for (let i = 0; i < groups.length; i++) {
    data.push({
      id: groups[i].id,
      name: groups[i].name,
      description: groups[i].description,
      userCount: await groups[i].countUsers(),
    });
  }

  // client response
  res.status(200).json({
    success: true,
    groups: data,
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
