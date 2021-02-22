const express = require("express");
const { getPublic } = require("../../controllers/v1/test.controller");
const router = express.Router();

const {
  getAttendance,
  getPayedUsers,
  getRegistered,
} = require("../../controllers").Admin.StatController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/attendance", verify, getAttendance);
router.get("/payed-users", verify, getPayedUsers);
router.get("/registered", verify, getRegistered);

module.exports = router;
