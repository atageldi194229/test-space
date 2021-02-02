const express = require("express");
const router = express.Router();

const {
  getAll,
  update,
  destroy,
} = require("../../controllers").Admin.ModeratorController;

const { verify, hasRole } = require("../../middleware").JwtMiddleware;

router.get("/", verify, hasRole("a"), getAll);
router.put("/:id", verify, hasRole("a"), update);
router.delete("/:id", verify, hasRole("a"), destroy);

module.exports = router;
