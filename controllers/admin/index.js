"use strict";

const AuthController = require("./auth.controller");
const ModeratorController = require("./moderator.controller");
const UserController = require("./user.controller");
const PriceController = require("./price.controller");
const PaymentController = require("./payment.controller");
const TestController = require("./test.controller");
const NotificationController = require("./notification.controller");

module.exports = {
  AuthController,
  ModeratorController,
  UserController,
  PriceController,
  PaymentController,
  TestController,
  NotificationController,
};
