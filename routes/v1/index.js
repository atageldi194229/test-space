"use strict";

const express = require("express");
const ApiV1Router = express.Router();

const AuthRouter = require("./auth.router");
const TestRouter = require("./test.router");
const QuestionRouter = require("./question.router");
const PriceRouter = require("./price.router");
const UserRouter = require("./user.router");

ApiV1Router.use("/tests", TestRouter);
ApiV1Router.use("/questions", QuestionRouter);
ApiV1Router.use("/prices", PriceRouter);
ApiV1Router.use("/users", UserRouter);
ApiV1Router.use("/", AuthRouter);

module.exports = ApiV1Router;
