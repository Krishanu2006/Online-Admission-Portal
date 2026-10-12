
const path = require("path");
const fs = require("fs/promises");
const mongoose = require("mongoose");

const Document = require("../models/mongodb/Document");
const documentService = require("../services/document.service");

const uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;

    const document = await documentService.uploadDocument(
      req.user.userId,
      documentType,
      req.file
    );

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await documentService.getDocuments(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Failed to fetch student documents:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    await documentService.deleteDocument(
      req.user.userId,
      req.params.documentId
    );

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await documentService.getAllDocuments();

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Failed to fetch documents:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

// Serve an uploaded document to an authenticated administrator.
const viewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const document = await Document.findById(documentId).lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const uploadDirectory = path.resolve(
      __dirname,
      "../../uploads/documents"
    );

    const filePath = path.resolve(document.filePath);
    const allowedPrefix = uploadDirectory + path.sep;

    // Prevent paths outside the configured document upload directory.
    if (!filePath.startsWith(allowedPrefix)) {
      return res.status(403).json({
        success: false,
        message: "Access to this file is not allowed",
      });
    }

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "Uploaded file not found on the server",
      });
    }

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedMimeTypes.includes(document.mimeType)) {
      return res.status(415).json({
        success: false,
        message: "Unsupported document type",
      });
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", "inline");

    return res.sendFile(filePath);
  } catch (error) {
    console.error("Failed to serve document:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to open document",
      });
    }
  }
};

// Admin accepts or rejects an individual document.
const reviewDocument = async (req, res) => {
  try {
    const { decision, rejectionReason } = req.body || {};

    if (!["VERIFIED", "REJECTED"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be VERIFIED or REJECTED.",
      });
    }

    if (
      decision === "REJECTED" &&
      (typeof rejectionReason !== "string" ||
        !rejectionReason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }

    const document = await documentService.reviewDocument(
      req.params.documentId,
      req.user.userId,
      decision,
      rejectionReason
    );

    return res.status(200).json({
      success: true,
      message:
        decision === "VERIFIED"
          ? "Document accepted successfully."
          : "Document rejected successfully.",
      data: document,
    });
  } catch (error) {
    console.error("Document review error:", error);

    const statusCode =
      error.message === "Document not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to review document.",
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getAllDocuments,
  viewDocument,
  reviewDocument,
};
