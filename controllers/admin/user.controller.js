"use strict";

const {
  User,
  Payment,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

const tools = {
  filter: (s) => {
    let where = {};
    if (s === "active") {
      where.active = true;
    } else if (s === "inactive") {
      where.active = false;
    }

    return where;
  },
  sort: (s) => {
    try {
      // validate data
      let a = s.split("-");
      a[1] = a[1].toLowerCase();

      let k = ["username", "gender", "birthDate", "createdAt"];

      if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
        return [a[0], a[1]];
      }
    } catch (err) {}
    return ["createdAt", "desc"];
  },
};

/**
 * prepare options for getting users from db using sequelize
 */
function prepareOptions({ limit, offset, sort, filter }) {
  let options = {
    limit,
    offset,
    where: {},
  };

  options.order = [tools.sort(sort)];
  options.where = { ...options.where, ...tools.filter(filter) };

  return options;
}

/**
 * get all users
 * action - /admin/users
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
  // client data
  let { query } = req,
    limit = parseInt(query.limit) || 20,
    offset = parseInt(query.offset) || 0,
    { sort, filter } = query;

  // prepare options
  let options = prepareOptions({ limit, offset, sort, filter });
  // request db
  let users = await User.findAll(options);
  let userCount = await User.count({
    where: options.where,
  });

  // client response
  res.status(200).json({
    success: true,
    userCount,
    users,
  });
};

/**
 * search from users
 * action - /admin/users/search
 * method - post
 * token
 */
obj.search = async (req, res) => {
  // client data
  let { query, body } = req,
    limit = parseInt(query.limit) || 20,
    offset = parseInt(query.offset) || 0,
    { sort, filter } = query,
    text = (body.text || "").toLowerCase();

  // prepare options
  let options = prepareOptions({ limit, offset, sort, filter });
  // search options
  options.where = {
    ...options.where,
    [Op.or]: [
      {
        username: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("User.username")),
          "LIKE",
          "%" + text + "%"
        ),
      },
      {
        phoneNumber: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("User.phone_number")),
          "LIKE",
          "%" + text + "%"
        ),
      },
      {
        email: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("User.email")),
          "LIKE",
          "%" + text + "%"
        ),
      },
    ],
  };

  // request db
  let users = await User.findAll(options);
  let userCount = await User.count({
    where: options.where,
  });

  // client response
  res.status(200).json({
    success: true,
    userCount,
    users,
  });
};

/**
 * get one user with more info
 * action - /admin/users/:id
 * method - get
 * token
 */
obj.getOne = async (req, res) => {
  // client data
  let id = req.params.id;

  // request db
  // user
  let user = await User.findOne({
    where: { id },
    attributes: {
      exclude: ["password"],
    },
  });

  // user balance
  let { tsc, tcc } = await Payment.getBalance(id);

  // client response
  res.status(200).json({
    success: true,
    user: {
      ...user.dataValues,
      balance: {
        tsc,
        tcc,
      },
    },
  });
};

/**
 * get one user with more info
 * action - /admin/users/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
  // client data
  let id = req.params.id,
    { password } = req.body;

  // request db
  let updatedRows = await User.update(
    { password: User.hashPassword(password) },
    { where: { id } }
  );

  if (!updatedRows) return next(new ErrorResponse("Password in not updated"));

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
