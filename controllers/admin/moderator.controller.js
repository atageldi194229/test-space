"use strict";

const {
  PrivilegedUser,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { JwtService } = require("../../services");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

// tools
const tools = {
  filter: (s) => {
    let where = {};
    // if (s === "allowed") {
    //   where.status = 1;
    // } else if (s === "cancelled") {
    //   where.status = 2;
    // } else if (s === "waiting") {
    //   where.status = 0;
    // }

    return where;
  },
  sort: (s) => {
    try {
      // validate data
      let a = s.split("-");
      a[1] = a[1].toLowerCase();

      let k = ["username", "createdAt"];

      if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
        return [a[0], a[1]];
      }
    } catch (err) {}
    return ["createdAt", "desc"];
  },
};

/**
 * get all moderators
 * action - /admin/users
 * method - get
 * token
 * role - a
 */
obj.getAll = async (req, res) => {
  // client data
  let { query } = req,
    limit = parseInt(query.limit) || 20,
    offset = parseInt(query.offset) || 0,
    { sort } = query;

  // request db
  let users = await PrivilegedUser.findAll({
    limit,
    offset,
    order: [tools.sort(sort)],
    where: { role: "m" },
    attributes: ["id", "username"],
  });

  // client response
  res.status(200).json({
    success: true,
    users,
  });
};

/**
 * search from moderators
 * action - /admin/users/search
 * method - post
 * token
 * role - a
 */
obj.search = async (req, res) => {
  // client data
  let text = (req.body.text || "").toLowerCase(),
    { query } = req,
    limit = parseInt(query.limit) || 20,
    offset = parseInt(query.offset) || 0,
    { sort } = query;

  // search options
  let options = {
    limit,
    offset,
    order: [tools.sort(sort)],
    where: {
      role: "m",
      [Op.or]: [
        {
          username: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("PrivilegedUser.username")),
            "LIKE",
            "%" + text + "%"
          ),
        },
      ],
    },
    attributes: ["id", "username"],
  };

  // request db
  let users = await PrivilegedUser.findAll(options);

  // client response
  res.status(200).json({
    success: true,
    users,
  });
};

/**
 * Update - moderator username or password
 * action - /admin/users/:id
 * method - put
 * token
 * role - a
 */
obj.update = async (req, res, next) => {
  const { username, password } = req.body,
    id = req.params.id;

  // validate & prepare
  let data = { username };
  if (password) data.password = PrivilegedUser.hashPassword(password);

  // request db
  let updatedRows = await PrivilegedUser.update(data, {
    where: { id, role: "m" },
  });

  // error test
  if (!updatedRows) return next(new ErrorResponse("User is not updated"));

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Delete - moderator username or password
 * action - /admin/users/:id
 * method - delete
 * token
 * role - a
 */
obj.delete = async (req, res, next) => {
  // client data
  const id = req.params.id;

  // request db
  let updatedRows = await PrivilegedUser.destroy(data, {
    where: { id, role: "m" },
  });

  // error test
  if (!updatedRows) return next(new ErrorResponse("User is not deleted"));

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
