const express = require("express");
const router = express.Router();

const {
  solveQuestion,
  removeSolvedQuestion,
  getSolvedQuestions,
} = require("../../controllers").V1.UserResultController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/:id/questions/:cid", verify, solveQuestion);
router.delete("/:id/questions/:cid", verify, removeSolvedQuestion);
router.get("/:id/questions", verify, getSolvedQuestions);

module.exports = router;
