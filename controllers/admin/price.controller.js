"use strict";

const {
  Price,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const obj = {};

const tools = {
  filter: (s) => {
    let where = {};
    if (s === "active") {
      where.status = true;
    } else if (s === "inactive") {
      where.status = false;
    } else if (s === "tsc") {
      where.type = 0;
    } else if (s === "tcc") {
      where.type = 1;
    } else if (s === "tsc-unlimited") {
      where.type = 2;
    } else if (s === "tcc-unlimited") {
      where.type = 3;
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
 * prepare options for getting prices from db using sequelize
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
 * get all prices
 * action - /admin/prices
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
  let prices = await Price.findAll(options);

  // client response
  res.status(200).json({
    success: true,
    prices,
  });
};

/**
 * set new prices
 * action - /admin/prices
 * method - post
 * token
 */
obj.set = async (req, res) => {
  // client data
  let {
    body: { type, data },
    user: { id: createdBy },
  } = req;

  // diactivate old prices with $type
  await Price.update({ status: false }, { where: { type } });

  // parsing the data if this tsc, tcc
  if (type === 0 || type === 1) data = JSON.stringify(data, null, 2);

  // add new price
  await Price.create({ type, data, createdBy });

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
