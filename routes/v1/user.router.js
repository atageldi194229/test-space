const express = require("express");
const { getOne } = require("../../controllers/v1/test.controller");
const router = express.Router();

const {
  findUsers,
  getOneByName,
} = require("../../controllers").V1.UserController;

// const { getUser } = require("../../middleware").JwtMiddleware;

router.post("/find", findUsers);
router.get("/:username", getOneByName);

module.exports = router;
