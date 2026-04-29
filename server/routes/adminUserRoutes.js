const express = require("express");
const { getAdminUsers, createAdminUser, updateAdminUser, resetAdminPassword, deleteAdminUser } = require("../controllers/adminUserController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireAuth, requireRole("super_admin"));

router.get("/", getAdminUsers);
router.post("/", createAdminUser);
router.patch("/:id", updateAdminUser);
router.post("/:id/reset-password", resetAdminPassword);
router.delete("/:id", deleteAdminUser);

module.exports = router;
