"use strict";

const {
  Price,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const obj = {};

obj.set = async (req, res) => {
  // logging req body
  console.log(JSON.stringify(req.body, null, 2));

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

  // res to the client with token
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
