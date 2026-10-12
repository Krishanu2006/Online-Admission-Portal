const express = require("express");

const documentController = require("../controllers/document.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// All document routes require student authentication.
router.use(authenticate);
router.use(authorize("STUDENT"));

// Upload a document.
router.post(
  "/",
  (req, res, next) => {
    console.log("\n========== DOCUMENT UPLOAD DEBUG ==========");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Authenticated user:", req.user?.userId);
    next();
  },
  upload.single("document"),
  (req, res, next) => {
    if (req.file) {
      console.log("Received file:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    } else {
      console.log("Received file: NO FILE RECEIVED");
    }

    console.log("Received fields:", req.body);
    console.log("===========================================\n");

    next();
  },
  documentController.uploadDocument
);

// Retrieve the authenticated student's documents.
router.get("/", documentController.getDocuments);

// Delete a document belonging to the authenticated student.
router.delete(
  "/:documentId",
  documentController.deleteDocument
);

module.exports = router;