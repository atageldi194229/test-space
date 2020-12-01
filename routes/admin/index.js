"use strict";

const express = require("express");
const AdminRouter = express.Router();

const PriceRouter = require("./price.router");

AdminRouter.use("/price", PriceRouter);

module.exports = AdminRouter;
