"use strict";

const {
  Price,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const obj = {};

obj.getInfo = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  // get data from db
  let tsc = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 0, status: true },
    }),
    tcc = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 1, status: true },
    }),
    tscUnlimitedPrice = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 2, status: true },
    }),
    tccUnlimitedPrice = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 3, status: true },
    });

  tsc = tsc.data;
  tcc = tcc.data;
  tscUnlimitedPrice = tscUnlimitedPrice.data;
  tccUnlimitedPrice = tccUnlimitedPrice.data;

  // res to the client with token
  res.status(200).json({
    success: true,
    data: {
      tsc: JSON.parse(tsc),
      tcc: JSON.parse(tcc),
      tscUnlimitedPrice: Number(tscUnlimitedPrice),
      tccUnlimitedPrice: Number(tccUnlimitedPrice),
    },
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
