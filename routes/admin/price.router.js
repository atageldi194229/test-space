const express = require("express");
const router = express.Router();

const { set } = require("../../controllers").Admin.PriceController;

const { getUser } = require("../../middleware").JwtMiddleware;

router.post("/", getUser, set);

module.exports = router;
