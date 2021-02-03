const express = require("express");
const router = express.Router();

const { create } = require("../../controllers").V1.MessageController;

router.post("/", create);

module.exports = router;
