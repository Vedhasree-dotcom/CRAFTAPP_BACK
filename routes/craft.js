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

router.put("/:id/save", protect, craftController.toggleSaveCraft);


// Admin
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "image", maxCount: 1 }, 
    { name: "stepImages" }          
  ]),
  craftController.createCraft
);


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


router.delete(
  "/:id",
  protect,
  adminOnly,
  craftController.deleteCraft
);


module.exports = router;
