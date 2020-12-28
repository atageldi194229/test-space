const express = require("express");
const router = express.Router();

const { getAll } = require("../../controllers").V1.TestController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);

module.exports = router;
