const express = require("express");
const router = express.Router();

const {
  getAll,
  canSendInvitation,
  canCreateTest,
  buyTscAndTcc,
} = require("../../controllers").V1.PaymentController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/tsc/check", verify, canSendInvitation);
router.post("/tcc/check", verify, canCreateTest);
router.post("/buy", verify, buyTscAndTcc);

module.exports = router;
