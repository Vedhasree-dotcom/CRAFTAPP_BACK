const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");



// GET /api/admin/dashboard-stats
router.get(
  "/dashboard-stats",
  protect,
  adminOnly,
  adminController.getDashboardStats
);


// GET /api/admin/users
router.get(
  "/users",
  protect,
  adminOnly,
  adminController.getAllUsers
);

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  adminController.deleteUser
);


// GET /api/admin/submissions
router.get(
  "/submissions",
  protect,
  adminOnly,
  adminController.getAllSubmissions
);

// PUT /api/admin/submission/:id/status
router.put(
  "/submission/:id/status",
  protect,
  adminOnly,
  adminController.updateSubmissionStatus
);

router.get(
  "/purchases",
  protect,
  adminOnly,
  adminController.getAllPurchases
);


module.exports = router;
