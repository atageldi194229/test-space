"use strict";

const express = require("express");
const ApiV1Router = express.Router();

// routers
const AuthRouter = require("./auth.router");
const TestRouter = require("./test.router");
const QuestionRouter = require("./question.router");
const PriceRouter = require("./price.router");
const UserRouter = require("./user.router");
const GroupRouter = require("./group.router");
const PaymentRouter = require("./payment.router");
const NotificationRouter = require("./notification.router");
const MessageRouter = require("./message.router");
const SolvingTestRouter = require("./solving-test.router");
const UserResultRouter = require("./user-result.router");
const BannerRouter = require("./banner.router");
// middleware
const { getUser } = require("../../middleware/jwt.middleware");

ApiV1Router.use(getUser);
ApiV1Router.use("/tests", TestRouter);
ApiV1Router.use("/questions", QuestionRouter);
ApiV1Router.use("/prices", PriceRouter);
ApiV1Router.use("/users", UserRouter);
ApiV1Router.use("/groups", GroupRouter);
ApiV1Router.use("/payments", PaymentRouter);
ApiV1Router.use("/notifications", NotificationRouter);
ApiV1Router.use("/messages", MessageRouter);
ApiV1Router.use("/solving-tests", SolvingTestRouter);
ApiV1Router.use("/user-results", UserResultRouter);
ApiV1Router.use("/banners", BannerRouter);
ApiV1Router.use("/", AuthRouter);

module.exports = ApiV1Router;
