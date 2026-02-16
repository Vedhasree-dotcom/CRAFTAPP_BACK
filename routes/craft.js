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
  upload.fields([
    { name: "image", maxCount: 1 },  // main craft image
    { name: "stepImages" }           // array of images for tutorial steps
  ]),
  craftController.createCraft
);


// ✏ Update Craft
router.put(
  "/:id",
  protect,
  adminOnly,
 upload.fields([
    { name: "image", maxCount: 1 },
    { name: "stepImages", maxCount: 20 },
  ]),
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
