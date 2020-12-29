const express = require("express");
const router = express.Router();

const {
  getAll,
  canSolveTest,
  startSolvingTest,
} = require("../../controllers").V1.SolvingTestController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.get("/:id/can-solve", verify, canSolveTest);
router.post("/:id/start-solve", verify, startSolvingTest);

module.exports = router;
