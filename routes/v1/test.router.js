const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getPublic,
  getOne,
  update,
  updateImage,
} = require("../../controllers").V1.TestController;

const { verify, isUserActive } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.get("/public", getPublic);
router.post("/", verify, isUserActive, create);
router.get("/:id", verify, getOne);
router.put("/:id", verify, update);
router.put("/:id/image", verify, updateImage);

module.exports = router;
