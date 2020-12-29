const express = require("express");
const router = express.Router();

const {
  solveQuestion,
  removeSolvedQuestion,
} = require("../../controllers").V1.UserResultController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/:id/questions/:cid", verify, solveQuestion);
router.delete("/:id/questions/:cid", verify, removeSolvedQuestion);

module.exports = router;
