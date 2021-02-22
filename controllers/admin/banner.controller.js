"use strict";

const {
  Banner,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const { saveFile, deleteFile } = require("../../utils/fileUpload");
const obj = {};

const tools = {
  filter: (s) => {
    let where = {};

    return where;
  },
  sort: (s) => {
    try {
      // validate data
      let a = s.split("-");
      a[1] = a[1].toLowerCase();

      let k = ["startTime", "createdAt", "endTime"];

      if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
        return [a[0], a[1]];
      }
    } catch (err) {}
    return ["createdAt", "desc"];
  },
};

/**
 * prepare options for getting users from db using sequelize
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
 * get all banners
 * action - /admin/banners
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
  // client data
  let { query } = req,
    limit = query.limit || 20,
    offset = query.offset || 0,
    { sort, filter } = query;

  let options = prepareOptions({ limit, offset, sort, filter });

  let count = await Banner.count();
  let banners = await Banner.findAll(options);

  // client response
  res.status(200).json({
    success: true,
    count,
    banners,
  });
};

/**
 * create banner
 * action - /admin/banners
 * method - post
 * token
 */
obj.create = async (req, res) => {
  // client data
  let {
      body: { keywords, payload, startTime, endTime, isActive },
    } = req,
    file = req.files["image"];

  // save image
  image = saveFile(file, "banner");

  let banner = await Banner.create({
    image,
    keywords,
    payload,
    startTime,
    endTime,
    isActive,
  });

  // client response
  res.status(200).json({
    success: true,
    banner,
  });
};

/**
 * update banner
 * action - /admin/banners/:id
 * method - put
 * token
 */
obj.update = async (req, res) => {
  // client data
  let {
    body: { keywords, payload, startTime, endTime, isActive },
  } = req;

  let banner = await Banner.create({
    keywords,
    payload,
    startTime,
    endTime,
    isActive,
  });

  // client response
  res.status(200).json({
    success: true,
    banner,
  });
};

/**
 * remove banner
 * action - /admin/banners/:id
 * method - delete
 * token
 */
obj.remove = async (req, res) => {
  // client data
  let {
    params: { id },
  } = req;

  let banner = await Banner.destroy({ where: { id } });

  // client response
  res.status(200).json({
    success: true,
    banner,
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
