const express = require("express");
const router = express.Router();

const { getInfo } = require("../../controllers").V1.PriceController;

// const { getUser } = require("../../middleware").JwtMiddleware;

router.get("/", getInfo);

module.exports = router;
