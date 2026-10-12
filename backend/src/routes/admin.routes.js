const express = require("express");

const adminApplicationController = require("../controllers/admin.application.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get(
  "/applications",
  adminApplicationController.getApplications
);
router.get(
  "/applications/:applicationId",
  adminApplicationController.getApplicationById
);
router.put(
  "/applications/:applicationId/status",
  adminApplicationController.updateApplicationStatus
);

module.exports = router;