const express = require("express");
const router = express.Router();

const { send } = require("../../controllers").Admin.NotificationController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/", verify, send);

module.exports = router;
