"use strict";

const AuthController = require("./auth.controller");
const TestController = require("./test.controller");
const QuestionController = require("./question.controller");
const PriceController = require("./price.controller");
const GroupController = require("./group.controller");
const UserController = require("./user.controller");
const PaymentController = require("./payment.controller");
const NotificationController = require("./notification.controller");

module.exports = {
  AuthController,
  TestController,
  QuestionController,
  PriceController,
  GroupController,
  UserController,
  PaymentController,
  NotificationController,
};
