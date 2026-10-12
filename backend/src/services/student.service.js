
const User = require("../models/mysql/User");
const Application = require("../models/mongodb/Application");
const Document = require("../models/mongodb/Document");

const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) return null;

  return {
    id: user.id,
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    is_active: user.is_active,
  };
};

const updateProfile = async (userId, { fname, lname, mobile }) => {
  if (
    typeof fname !== "string" ||
    !fname.trim() ||
    typeof lname !== "string" ||
    !lname.trim() ||
    typeof mobile !== "string" ||
    !mobile.trim()
  ) {
    throw new Error("First name, last name, and mobile are required");
  }

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new Error("Student profile not found");
  }

  const existingMobile = await User.findByMobile(mobile.trim());

  if (existingMobile && Number(existingMobile.id) !== Number(userId)) {
    throw new Error("Mobile number is already registered");
  }

  const updatedUser = await User.updateProfile(userId, {
    fname: fname.trim(),
    lname: lname.trim(),
    mobile: mobile.trim(),
  });

  return {
    id: updatedUser.id,
    fname: updatedUser.fname,
    lname: updatedUser.lname,
    email: updatedUser.email,
    mobile: updatedUser.mobile,
    role: updatedUser.role,
    is_active: updatedUser.is_active,
  };
};

const getApplicationStatus = async (userId) => {
  const application = await Application.findOne({ userId }).lean();

  if (!application) {
    throw new Error("Application not found");
  }

  const documents = await Document.find({
    userId,
    applicationId: application.applicationId,
  }).lean();

  return {
    applicationId: application.applicationId,
    status: application.status,
    rejectionReason: application.rejectionReason || null,
    submittedAt:
      application.status === "DRAFT" ? null : application.updatedAt,
    documents: documents.map((document) => ({
      id: document._id,
      documentType: document.documentType,
      fileName: document.fileName,
      verificationStatus: document.verificationStatus,
      rejectionReason: document.rejectionReason,
    })),
  };
};

module.exports = {
  getProfile,
  updateProfile,
  getApplicationStatus,
};
