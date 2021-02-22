"use strict";

const {
  Banner,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

/**
 * get all banners
 * action - /v1/banners
 * method - get
 */
obj.getAll = async (req, res, next) => {
  // get from client
  let search = (req.query.search || "").toLowerCase();

  let NOW = new Date();

  let banners = await Banner.findAll({
    startTime: { [Op.lte]: NOW },
    endTime: { [Op.gte]: NOW },
    isActive: true,
    keywords: sequelize.where(
      sequelize.fn("LOWER", sequelize.col("Test.keywords")),
      "LIKE",
      "%" + text + "%"
    ),
  });

  // client response
  res.status(200).json({
    success: true,
    banners,
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
