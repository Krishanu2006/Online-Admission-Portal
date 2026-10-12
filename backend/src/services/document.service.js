
const mongoose = require("mongoose");
const Document = require("../models/mongodb/Document");
const Application = require("../models/mongodb/Application");
const fs = require("fs/promises");

const deleteDocument = async (userId, documentId) => {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new Error("Invalid document ID");
  }

  const document = await Document.findOne({
    _id: documentId,
    userId,
  });

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.verificationStatus === "VERIFIED") {
    throw new Error("Verified documents cannot be deleted");
  }

  const application = await Application.findOne({
    applicationId: document.applicationId,
  }).lean();

  if (
    application &&
    ["APPROVED", "REJECTED"].includes(application.status)
  ) {
    throw new Error(
      "Documents cannot be deleted after the application is finalized"
    );
  }

  try {
    await fs.unlink(document.filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  await Document.deleteOne({ _id: documentId });

  return true;
};

const uploadDocument = async (userId, documentType, file) => {
  if (!documentType) {
    throw new Error("Document type is required");
  }

  if (!file) {
    throw new Error("Document file is required");
  }

  const application = await Application.findOne({ userId }).lean();

  if (!application) {
    throw new Error("Application not found");
  }

  if (["APPROVED", "REJECTED"].includes(application.status)) {
    throw new Error(
      "Documents cannot be uploaded after the application is finalized"
    );
  }

  const document = await Document.create({
    applicationId: application.applicationId,
    userId,
    documentType,
    fileName: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    verificationStatus: "PENDING",
  });

  return document;
};

const getDocuments = async (userId) => {
  return Document.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};

const getAllDocuments = async () => {
  return Document.find()
    .sort({ createdAt: -1 })
    .lean();
};

// Admin accepts or rejects an individual document.
const reviewDocument = async (
  documentId,
  adminUserId,
  decision,
  rejectionReason = null
) => {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new Error("Invalid document ID");
  }

  if (!["VERIFIED", "REJECTED"].includes(decision)) {
    throw new Error("Decision must be VERIFIED or REJECTED");
  }

  if (
    decision === "REJECTED" &&
    (typeof rejectionReason !== "string" ||
      !rejectionReason.trim())
  ) {
    throw new Error("A rejection reason is required");
  }

  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  const application = await Application.findOne({
    applicationId: document.applicationId,
  });

  if (!application) {
    throw new Error("Associated application not found");
  }

  if (["APPROVED", "REJECTED"].includes(application.status)) {
    throw new Error(
      "Documents cannot be reviewed after the application is finalized"
    );
  }

  document.verificationStatus = decision;
  document.rejectionReason =
    decision === "REJECTED" ? rejectionReason.trim() : null;
  document.reviewedAt = new Date();

  if (adminUserId !== null && adminUserId !== undefined) {
    document.reviewedBy = adminUserId;
  }

  await document.save();

  return document;
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getAllDocuments,
  reviewDocument,
};
