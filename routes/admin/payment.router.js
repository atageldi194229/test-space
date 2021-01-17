const express = require("express");
const router = express.Router();

const { getAll, update } = require("../../controllers").Admin.PaymentController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.put("/:id", verify, update);

module.exports = router;
