const express = require("express");
const router = express.Router();

const {
  getAll,
  canSolveTest,
  startSolvingTest,
  finishSolvingTest,

  checkStatus,
  startSolvingPublicTest,
  finishSolvingPublicTest,
} = require("../../controllers").V1.SolvingTestController;

const { verify, isUserActive } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);

router.get("/:id/can-solve", verify, isUserActive, canSolveTest);
router.post("/:id/start-solve", verify, isUserActive, startSolvingTest);
router.post("/:id/finish-solve", verify, finishSolvingTest);

router.get("/:id/check-status", verify, isUserActive, checkStatus);
router.post(
  "/:id/start-solve-public",
  verify,
  isUserActive,
  startSolvingPublicTest
);
router.post("/:id/finish-solve-public", verify, finishSolvingPublicTest);

module.exports = router;
