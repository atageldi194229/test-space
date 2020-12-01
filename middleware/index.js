const JwtMiddleware = require("./jwt.middleware");
// const RulesMiddleware = require("./rules.middleware");
// const CacheMiddleware = require("./cache.middleware");
// const { upload } = require("./multer.middleware");
// const Validator = require("./validator");
const asyncHandler = require("./async");
const errorHandler = require("./error");

module.exports = {
  JwtMiddleware,
  // RulesMiddleware,
  // CacheMiddleware,
  // upload,
  // Validator,
  asyncHandler,
  errorHandler,
};
