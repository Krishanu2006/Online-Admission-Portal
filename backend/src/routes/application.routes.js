
const express = require("express");

const applicationController = require("../controllers/application.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

// Validate middleware exports before registering routes.
if (typeof authenticate !== "function") {
  throw new TypeError(
    "auth.middleware.js must export the authenticate function directly."
  );
}

if (typeof authorize !== "function") {
  throw new TypeError(
    "role.middleware.js must export the authorize function directly."
  );
}

const requiredHandlers = [
  "createApplication",
  "getApplication",
  "updateApplication",
  "submitApplication",
];

for (const handler of requiredHandlers) {
  if (typeof applicationController[handler] !== "function") {
    throw new TypeError(
      `application.controller.js is missing a function export: ${handler}`
    );
  }
}

router.use(authenticate);
router.use(authorize("STUDENT"));

router.post("/", applicationController.createApplication);
router.get("/", applicationController.getApplication);
router.put("/", applicationController.updateApplication);
router.post("/submit", applicationController.submitApplication);

module.exports = router;
