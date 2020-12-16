const express = require("express");
const router = express.Router();

const {
  sendInvitation,
} = require("../../controllers").V1.NotificationController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/send-invitation", verify, sendInvitation);

module.exports = router;
