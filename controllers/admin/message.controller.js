"use strict";

const {
  Message,
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
    if (s === "served") {
      where.status = 1;
    } else if (s === "denied") {
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

      let k = ["createdAt"];

      if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
        return [a[0], a[1]];
      }
    } catch (err) {}
    return ["createdAt", "desc"];
  },
};

/**
 * get all messages
 * action - /admin/messages
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
  let options = {
    limit,
    offset,
    order: [tools.sort(sort)],
    where: { ...tools.filter(filter) },
  };

  // request db
  let messages = await Message.findAll(options);

  let messageCount = await Message.count({
    where: options.where,
  });

  // client response
  res.status(200).json({
    success: true,
    messageCount,
    messages,
  });
};

/**
 * search from messages
 * action - /admin/messages/search
 * method - post
 * token
 */
obj.search = async (req, res) => {
  // client data
  let text = (req.body.text || "").toLowerCase(),
    { query } = req,
    limit = parseInt(query.limit) || 20,
    offset = parseInt(query.offset) || 0,
    { sort, filter } = query;

  // search options
  let options = {
    limit,
    offset,
    order: [tools.sort(sort)],
    where: {
      ...tools.filter(filter),
      [Op.or]: [
        {
          text: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Message.text")),
            "LIKE",
            "%" + text + "%"
          ),
          note: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Message.note")),
            "LIKE",
            "%" + text + "%"
          ),
        },
      ],
    },
  };

  // request db
  let messages = await Message.findAll(options);
  let messageCount = await Message.count({
    where: options.where,
  });

  // client response
  res.status(200).json({
    success: true,
    messageCount,
    messages,
  });
};

/**
 * Update - message
 * action - /admin/messages/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
  const { status, note } = req.body,
    id = req.params.id;

  // validate & prepare
  if (![0, 1, 2].includes(status))
    return next(new ErrorResponse("Validation Error"));

  // request db
  let updatedRows = await Message.update(
    { note, status },
    {
      where: { id },
    }
  );

  // error test
  if (!updatedRows) return next(new ErrorResponse("Message is not updated"));

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Delete - messages
 * action - /admin/messages/:id
 * method - delete
 * token
 */
obj.destroy = async (req, res, next) => {
  // client data
  const id = req.params.id;

  // request db
  let updatedRows = await Message.destroy({
    where: { id },
  });

  // error test
  if (!updatedRows) return next(new ErrorResponse("Message is not deleted"));

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
