"use strict";

const express = require("express");
const ApiV1Router = express.Router();

const AuthRouter = require("./auth.router");
const QuestionRouter = require("./question.router");
const PriceRouter = require("./price.router");

ApiV1Router.use("/", AuthRouter);
ApiV1Router.use("/questions", QuestionRouter);
ApiV1Router.use("/price", PriceRouter);

module.exports = ApiV1Router;
