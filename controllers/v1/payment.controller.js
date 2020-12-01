"use strict";

const {
  Price,
  Payment,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const { v4: uuidv4 } = require("uuid");
const obj = {};

obj.buyProduct = async (req, res, next) => {
  console.log(JSON.stringify(req.body, null, 2));

  // init data
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

  // tsc = tsc.data;
  // tcc = tcc.data;
  // tscUnlimitedPrice = tscUnlimitedPrice.data;
  // tccUnlimitedPrice = tccUnlimitedPrice.data;

  let data = { userId: req.user.id },
    { body } = req; // body: { tsc, tcc }

  // tsc
  if (tsc === "unlimited") {
    data.isTscUnlimited = true;
    data.tscPriceId = tscUnlimitedPrice.id;
  } else {
    data.tsc = Number(body.tsc);

    let a = -1,
      v = JSON.parse(tsc.data);
    for (let i = 0; i < v.length; i++) {
      if (v[i].ranges.start <= data.tsc && v[i].ranges.end > data.tsc)
        a = v[i].price;
    }

    if (a === -1) return next(new ErrorResponse("TSC out of range"));

    data.tscMoney = a * data.tsc;
    data.tscPriceId = tsc.id;
  }

  // tcc
  if (tcc === "unlimited") {
    data.isTccUnlimited = true;
    data.tccPriceId = tccUnlimitedPrice.id;
  } else {
    data.tcc = Number(body.tcc);

    let a = -1,
      v = JSON.parse(tcc.data);
    for (let i = 0; i < v.length; i++) {
      if (v[i].ranges.start <= data.tcc && v[i].ranges.end > data.tcc)
        a = v[i].price;
    }

    if (a === -1) return next(new ErrorResponse("TSC out of range"));

    data.tccMoney = a * data.tcc;
    data.tccPriceId = tcc.id;
  }

  // res to the client with token
  res.status(200).json({
    success: true,
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
