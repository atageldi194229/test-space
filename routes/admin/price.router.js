const express = require("express");
const router = express.Router();

const { getAll, set } = require("../../controllers").Admin.PriceController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/", verify, set);

module.exports = router;
