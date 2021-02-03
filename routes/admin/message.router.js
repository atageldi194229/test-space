const express = require("express");
const router = express.Router();

const {
  getAll,
  search,
  update,
  destroy,
} = require("../../controllers").Admin.MessageController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/search", verify, search);
router.put("/:id", verify, update);
router.delete("/:id", verify, destroy);

module.exports = router;
