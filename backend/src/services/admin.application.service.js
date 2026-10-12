const Application = require("../models/mongodb/Application");
const Document = require("../models/mongodb/Document");

const getApplications = async () => {
  return Application.find()
    .sort({ createdAt: -1 })
    .lean();
};

const getApplicationById = async (applicationId) => {
  return Application.findOne({ applicationId }).lean();
};

const updateApplicationStatus = async (
  applicationId,
  status,
  rejectionReason = null,
  adminUserId = null
) => {
  const application = await Application.findOne({ applicationId });

  if (!application) {
    throw new Error("Application not found.");
  }

  const allowedStatuses = [
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid application status.");
  }

  if (["APPROVED", "REJECTED"].includes(application.status)) {
    throw new Error("Finalized application cannot be modified.");
  }

  if (
    status === "REJECTED" &&
    (typeof rejectionReason !== "string" || !rejectionReason.trim())
  ) {
    throw new Error("Rejection reason is required.");
  }

  const documents = await Document.find({
    applicationId: application.applicationId,
  })
    .select("verificationStatus")
    .lean();

  if (status === "APPROVED") {
    if (documents.length === 0) {
      throw new Error(
        "Cannot approve the application because no documents are uploaded."
      );
    }

    const unverifiedDocuments = documents.filter(
      (document) => document.verificationStatus !== "VERIFIED"
    );

    if (unverifiedDocuments.length > 0) {
      throw new Error(
        "Verify all uploaded documents before approving the application."
      );
    }
  }

  application.status = status;
  application.rejectionReason =
    status === "REJECTED" ? rejectionReason.trim() : null;

  await application.save();

  // Record review metadata without automatically verifying documents.
  if (status === "REJECTED") {
    const documentUpdate = {
      verificationStatus: "REJECTED",
      rejectionReason: rejectionReason.trim(),
      reviewedAt: new Date(),
    };

    if (adminUserId !== null && adminUserId !== undefined) {
      documentUpdate.reviewedBy = adminUserId;
    }

    await Document.updateMany(
      { applicationId: application.applicationId },
      { $set: documentUpdate }
    );
  }

  return application;
};

module.exports = {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
};