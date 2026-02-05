const express = require("express");
const router = express.Router();
const craftController = require("../controllers/CraftController");
const { protect, adminOnly} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadCraft");


router.post("/find", protect, craftController.findCraftsByMaterial);

router.get("/", craftController.getAllCrafts);
router.get("/category/:category", craftController.getCraftsByCategory);
router.get("/:id", craftController.getCraftById);

// Admin
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"), 
  craftController.createCraft
);

module.exports = router;
