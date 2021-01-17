const express = require("express");
const router = express.Router();

const {
  getAll,
  update,
} = require("../../controllers").Admin.ModeratorController;

const { verify, hasRole } = require("../../middleware").JwtMiddleware;

router.get("/", verify, hasRole("a"), getAll);
router.put("/:id", verify, hasRole("a"), update);

module.exports = router;
