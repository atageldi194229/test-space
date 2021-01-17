"use strict";

const express = require("express");
const AdminRouter = express.Router();

const AuthRouter = require("./auth.router");
const ModeratorRouter = require("./moderator.router");
const UserRouter = require("./user.router");
const PriceRouter = require("./price.router");
const PaymentRouter = require("./payment.router");
const TestRouter = require("./test.router");
const NotificationRouter = require("./notification.router");

// require middleware
const { getUser } = require("../../middleware/jwt.middleware");
// use middleware
AdminRouter.use(getUser);

AdminRouter.use("/", AuthRouter);
AdminRouter.use("/moderators", ModeratorRouter);
AdminRouter.use("/users", UserRouter);
AdminRouter.use("/prices", PriceRouter);
AdminRouter.use("/payments", PaymentRouter);
AdminRouter.use("/tests", TestRouter);
AdminRouter.use("/notifications", NotificationRouter);

module.exports = AdminRouter;
