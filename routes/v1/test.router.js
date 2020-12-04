const express = require("express");
const router = express.Router();

const { create, getAll } = require("../../controllers").V1.TestController;

const { getUser } = require("../../middleware").JwtMiddleware;

router.get("/", getAll);
router.post("/", getUser, create);

module.exports = router;
