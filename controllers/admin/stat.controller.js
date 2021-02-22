"use strict";

const {
  User,
  Payment,
  Attendance,
  sequelize,
  Sequelize: { Op, QueryTypes },
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

      let k = ["username", "gender", "birthDate", "createdAt", "loggedAt"];

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
 * attendance count by time range
 * action - /admin/stats/attendance
 * method - get
 * token
 */
obj.getAttendance = async (req, res) => {
  // client data
  let { query } = req,
    from = new Date(parseInt(query.from)),
    to = new Date(parseInt(query.to)),
    limit = query.limit || 20,
    offset = query.offset || 0;

  let options = {
    where: {
      [Op.and]: [
        {
          createdAt: {
            [Op.gte]: from,
          },
        },
        {
          createdAt: {
            [Op.lte]: to,
          },
        },
      ],
    },
  };

  let count = await Attendance.count(options);

  let attendance = await Attendance.findAll({
    ...options,
    limit,
    offset,
    include: {
      association: "user",
      attributes: ["id", "username", "firstName", "lastName", "email", "image"],
    },
  });

  // client response
  res.status(200).json({
    success: true,
    count,
    attendance,
  });
};

/**
 * register count by time range
 * action - /admin/stats/registered
 * method - get
 * token
 */
obj.getRegistered = async (req, res) => {
  // client data
  let { query } = req,
    from = new Date(parseInt(query.from)),
    to = new Date(parseInt(query.to)),
    limit = query.limit || 20,
    offset = query.offset || 0;

  let options = {
    where: {
      [Op.and]: [
        {
          createdAt: {
            [Op.gte]: from,
          },
        },
        {
          createdAt: {
            [Op.lte]: to,
          },
        },
      ],
    },
  };

  let count = await User.count(options);

  let users = await User.findAll({
    ...options,
    limit,
    offset,
    attributes: ["id", "username", "firstName", "lastName", "email", "image"],
  });

  // client response
  res.status(200).json({
    success: true,
    count,
    users,
  });
};

/**
 * payed count by time range
 * action - /admin/stats/registered
 * method - get
 * token
 */
obj.getUserPaymentStat = async (req, res) => {
  // client data
  let { query } = req,
    from = new Date(parseInt(query.from)),
    to = new Date(parseInt(query.to)),
    limit = query.limit || 20,
    offset = query.offset || 0;

  let row = await sequelize.query(
    `
    SELECT
    SUM(CASE WHEN user_balance.id is null OR user_balance.payment_history_count = 1 THEN 1 ELSE 0 END) TOLEGSIZ,
    SUM(CASE WHEN user_balance.payment_history_count > 1 THEN 1 ELSE 0 END) TOLEGLI
    FROM users
    LEFT JOIN user_balance ON users.id = user_balance.id
  `,
    { type: QueryTypes.SELECT }
  );

  // client response
  res.status(200).json({
    success: true,
    ...row[0],
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
