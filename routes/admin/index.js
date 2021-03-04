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
const MessageRouter = require("./message.router");
const BannerRouter = require("./banner.router");
const StatRouter = require("./stat.router");

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
AdminRouter.use("/messages", MessageRouter);
AdminRouter.use("/banners", BannerRouter);
AdminRouter.use("/stats", StatRouter);

module.exports = AdminRouter;
