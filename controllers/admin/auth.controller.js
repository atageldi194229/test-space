"use strict";

const {sequelize, Sequelize: {Op}} = require('../../models');
const asyncHandler = require('../../middleware/async');
const obj = {};


obj.list = async (req, res) => {
  
}

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = ['status'];
for (let i = 0; i < keys.length; i++)
  if(!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
