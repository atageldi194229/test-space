"use strict";

const {
  User,
  Test,
  SolvingTest,
  Payment,
  Attendance,
  sequelize,
  Sequelize: { Op, QueryTypes },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

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
 * user and payment
 * action - /admin/stats/user-payment
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
      SUM(user_balance.id IS NULL OR user_balance.payment_history_count = 1) TOLEGSIZ,
      SUM(user_balance.payment_history_count IS NOT NULL AND user_balance.payment_history_count > 1) TOLEGLI
    FROM
      users
      LEFT JOIN
      user_balance
      ON 
        users.id = user_balance.id;
  `,
    { plain: true, type: QueryTypes.SELECT }
  );

  // client response
  res.status(200).json({
    success: true,
    ...row,
  });
};

/**
 * test count
 * action - /admin/stats/tests
 * method - get
 * token
 */
obj.getTestCount = async (req, res) => {
  // client data
  let { query } = req;
  let from = new Date(parseInt(query.from)),
    to = new Date(parseInt(query.to));

  let testCount = await Test.count({});
  let solvedTestCount = await SolvingTest.count({ where: { isPublic: false } });

  // client response
  res.status(200).json({
    success: true,
    testCount,
    solvedTestCount,
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
