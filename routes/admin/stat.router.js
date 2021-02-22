const express = require("express");
const router = express.Router();

const {
  getAttendance,
  getUserPaymentStat,
  getRegistered,
  getTestCount,
} = require("../../controllers").Admin.StatController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/attendance", verify, getAttendance);
router.get("/user-payment", verify, getUserPaymentStat);
router.get("/registered", verify, getRegistered);
router.get("/tests", verify, getTestCount);

module.exports = router;
