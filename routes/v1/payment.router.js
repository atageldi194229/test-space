const express = require("express");
const router = express.Router();

const { canSendInvitation } = require("../../controllers").V1.PaymentController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/tsc/check", verify, canSendInvitation);

module.exports = router;
