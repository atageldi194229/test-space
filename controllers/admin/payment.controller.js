"use strict";

const {
  Payment,
  Notification,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

const tools = {
  filter: (s) => {
    let where = {};
    if (s === "allowed") {
      where.status = 1;
    } else if (s === "cancelled") {
      where.status = 2;
    } else if (s === "waiting") {
      where.status = 0;
    }

    return where;
  },
  sort: (s) => {
    try {
      // validate data
      let a = s.split("-");
      a[1] = a[1].toLowerCase();

      let k = ["allowedAt", "createdAt"];

      if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
        return [a[0], a[1]];
      }
    } catch (err) {}
    return ["createdAt", "desc"];
  },
};

/**
 * prepare options for getting payments from db using sequelize
 */
function prepareOptions({ limit, offset, sort, filter }) {
  let options = {
    limit,
    offset,
    where: {},
    include: [
      {
        association: "user",
        attributes: ["id", "username", "email", "phoneNumber"],
      },
    ],
  };

  options.order = [tools.sort(sort)];
  options.where = { ...options.where, ...tools.filter(filter) };

  return options;
}

/**
 * get all payments
 * action - /admin/payments
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
  // client data
  let { query } = req,
    limit = parseInt(query.limit) || 20,
    offset = parseInt(query.offset) || 0,
    sort = query.sort,
    filter = query.filter;

  // prepare options
  let options = prepareOptions({ limit, offset, sort, filter });
  // request db
  let payments = await Payment.findAll(options);

  // client response
  res.status(200).json({
    success: true,
    payments,
  });
};

/**
 * search from payments
 * action - /admin/payments/search
 * method - post
 * token
 */
obj.search = async (req, res) => {
  // client data
  let { query, body } = req,
    limit = parseInt(query.limit) || 20,
    offset = parseInt(query.offset) || 0,
    sort = query.sort,
    filter = query.filter,
    text = (body.text || "").toLowerCase();

  // prepare options
  let options = prepareOptions({ limit, offset, sort, filter });
  options.where = {
    ...options.where,
    [Op.or]: [
      {
        username: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("user.username")),
          "LIKE",
          "%" + text + "%"
        ),
      },
      {
        email: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("user.email")),
          "LIKE",
          "%" + text + "%"
        ),
      },
      {
        phoneNumber: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("user.phone_number")),
          "LIKE",
          "%" + text + "%"
        ),
      },
    ],
  };

  // request db
  let payments = await Payment.findAll(options);

  // client response
  res.status(200).json({
    success: true,
    payments,
  });
};

/**
 * update test
 * action - /admin/payments/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
  // client data
  let { status, note } = req.body,
    modifiedBy = req.user.id,
    { id } = req.params;

  // request db
  let payment = await Payment.findOne({ where: { id } });

  // prepare data
  let data = { status, modifiedBy, note };
  if (status === 1) {
    data.allowedAt = new Date();
  } else if (status === 2) {
    data.allowedAt = null;
  } else if (status) {
    return next(new ErrorResponse("Invalid data"));
  }

  let updatedRows = await payment.update(data);

  // error test
  if (!updatedRows) return next(new ErrorResponse("Payment is not updated"));

  // send notification
  if (status === 1) {
    await Notification.send(payment.userId, {
      action: "payment +",
      data: {
        createdAt: payment.createdAt.toLocaleString(),
        id: payment.id,
        tsc: payment.tsc,
        tcc: payment.tcc,
        tscMoney: payment.tscMoney,
        tccMoney: payment.tccMoney,
      },
    });
  } else if (status === 2) {
    await Notification.send(payment.userId, {
      action: "payment -",
      data: {
        createdAt: payment.createdAt.toLocaleString(),
        id: payment.id,
        tsc: payment.tsc,
        tcc: payment.tcc,
        tscMoney: payment.tscMoney,
        tccMoney: payment.tccMoney,
      },
    });
  }

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
