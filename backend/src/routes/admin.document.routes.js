
const express = require("express");

const documentController = require("../controllers/document.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

// All routes require an authenticated administrator.
router.use(authenticate);
router.use(authorize("ADMIN"));

// Retrieve all student documents for review.
router.get("/", documentController.getAllDocuments);

// Preview an uploaded document securely.
router.get(
  "/:documentId/view",
  documentController.viewDocument
);

// Accept or reject an individual document.
router.patch(
  "/:documentId/review",
  documentController.reviewDocument
);

module.exports = router;
