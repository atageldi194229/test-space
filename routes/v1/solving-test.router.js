const express = require("express");
const router = express.Router();

const { getAll, solveTest } = require("../../controllers").V1.TestController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.get("/v1/solving-tests/:id/solve", verify, solveTest);

module.exports = router;
