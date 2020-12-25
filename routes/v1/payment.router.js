const express = require("express");
const router = express.Router();

const {
  canSendInvitation,
  buyTscAndTcc,
} = require("../../controllers").V1.PaymentController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/tsc/check", verify, canSendInvitation);
router.post("/buy", verify, buyTscAndTcc);

module.exports = router;
