const express = require("express");
const router = express.Router();

const { create, update } = require("../../controllers").V1.QuestionController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/", verify, create);
router.put("/:id", verify, update);

module.exports = router;
