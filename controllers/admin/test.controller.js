"use strict";

const {
  Test,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

const tools = {
  filter: (s) => {
    let where = {};
    if (s === "public") {
      where.isPublic = true;
      where.allowedAt = {
        [Op.ne]: null,
      };
    } else if (s === "private") {
      where.isPublic = false;
    } else if (s === "waiting") {
      where.isPublic = true;
      where.allowedAt = null;
    } else if (s === "editable") {
      where.editable = true;
    } else if (s === "non-editable") {
      where.editable = false;
    }

    return where;
  },
  sort: (s) => {
    try {
      // validate data
      let a = s.split("-");
      a[1] = a[1].toLowerCase();

      let k = ["name", "likeCount", "solveCount", "createdAt", "allowedAt"];

      if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
        return [a[0], a[1]];
      }
    } catch (err) {}
    return ["createdAt", "desc"];
  },
};

/**
 * prepare options for getting tests from db using sequelize
 */
function prepareOptions({ limit, offset, sort, filter }) {
  let options = {
    limit,
    offset,
    where: {},
    include: [
      {
        association: "questions",
      },
    ],
  };

  options.order = [tools.sort(sort)];
  options.where = { ...options.where, ...tools.filter(filter) };

  return options;
}

/**
 * get all tests
 * action - /admin/tests
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
  let tests = await Test.findAll(options);
  let testCount = await Test.count({
    where: options.where,
  });

  // client response
  res.status(200).json({
    success: true,
    testCount,
    tests,
  });
};

/**
 * search from tests
 * action - /admin/tests/search
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
  // search options
  options.where = {
    ...options.where,
    ...{
      [Op.or]: [
        {
          name: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Test.name")),
            "LIKE",
            "%" + text + "%"
          ),
        },
        {
          keywords: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Test.keywords")),
            "LIKE",
            "%" + text + "%"
          ),
        },
      ],
    },
  };

  // request db
  let tests = await Test.findAll(options);
  let testCount = await Test.count({
    where: options.where,
  });

  // client response
  res.status(200).json({
    success: true,
    testCount,
    tests,
  });
};

/**
 * update test
 * action - /admin/tests/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
  // client data
  let { allow } = req.body,
    { id } = req.params;

  // prepare data
  let data = { allowedAt: (allow && new Date()) || null };

  let updatedRows = await Test.update(data, { where: { id } });

  // error test
  if (!updatedRows) return next(new ErrorResponse("Test is not updated"));

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
