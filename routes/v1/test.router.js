const express = require("express");
const router = express.Router();

const {
  create,
  getOne,
  getOnePublic,
  update,
  updateImage,

  getAll,
  getPublic,
  getLatest,
  getPopular,
  getArchived,
  getSolved,
  getPinned,

  pin,
  unpin,

  search,
} = require("../../controllers").V1.TestController;

const { verify, isUserActive } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.get("/public", verify, getPublic);
router.get("/latest", verify, getLatest);
router.get("/popular", verify, getPopular);
router.get("/archived", verify, getArchived);
router.get("/solved", verify, getSolved);
router.get("/pinned", verify, getPinned);

router.post("/search", verify, search);

router.post("/", verify, isUserActive, create);
router.get("/:id", verify, getOne);
router.get("/:id/public", verify, getOnePublic);
router.put("/:id", verify, update);
router.put("/:id/image", verify, updateImage);

router.post("/:id/pin", verify, pin);
router.post("/:id/unpin", verify, unpin);

module.exports = router;
