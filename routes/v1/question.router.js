const express = require("express");
const router = express.Router();

const { create } = require("../../controllers").V1.QuestionController;

const { getUser } = require("../../middleware").JwtMiddleware;

router.post("/", getUser, create);

module.exports = router;
