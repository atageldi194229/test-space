const express = require("express");
const router = express.Router();

const { getAll } = require("../../controllers").V1.BannerController;

router.get("/", getAll);

module.exports = router;
