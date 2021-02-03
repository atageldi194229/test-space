const express = require("express");
const router = express.Router();

const { create } = require("../../controllers").V1.UserController;

router.post("/", create);

module.exports = router;
