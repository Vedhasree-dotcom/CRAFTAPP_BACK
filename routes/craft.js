const express = require("express");
const router = express.Router();
const craftController = require("../controllers/CraftController");
const { protect, adminOnly} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadCraft");


router.post(
  "/find-by-image",
  protect,
  upload.single("image"),
  craftController.findCraftsByImage
);


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


// ✏ Update Craft
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  craftController.updateCraft
);

// 🗑 Delete Craft
router.delete(
  "/:id",
  protect,
  adminOnly,
  craftController.deleteCraft
);


module.exports = router;
