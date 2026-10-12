
const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

// Public authentication routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/admin/login", authController.loginAdmin);

// Authenticated user routes
router.get("/me", authenticate, authController.getMe);

// Authenticated password-change route.
// The controller restricts this feature to student accounts.
router.post(
  "/change-password",
  authenticate,
  authController.changePassword
);

module.exports = router;
