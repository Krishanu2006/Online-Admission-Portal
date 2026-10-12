
const Application = require("../models/mongodb/Application");
const generateApplicationId = require("../utils/generateApplicationId");

const getOrCreateApplication = async (userId) => {
  let application = await Application.findOne({ userId });

  if (!application) {
    application = await Application.create({
      applicationId: generateApplicationId(),
      userId,
      status: "DRAFT",
    });
  }

  return application;
};

const createApplication = async (userId) => {
  return getOrCreateApplication(userId);
};

const getApplication = async (userId) => {
  return getOrCreateApplication(userId);
};

const updateApplication = async (userId, data) => {
  const application = await Application.findOne({ userId });

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.status !== "DRAFT") {
    throw new Error("Only draft applications can be edited");
  }

  const allowedFields = [
    "personalDetails",
    "contactDetails",
    "academicDetails",
    "coursePreferences",
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      application.set(field, data[field]);
    }
  }

  await application.save();

  return application;
};

const submitApplication = async (userId) => {
  const application = await Application.findOne({ userId });

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.status !== "DRAFT") {
    throw new Error("Only draft applications can be submitted");
  }

  const personal = application.personalDetails || {};
  const contact = application.contactDetails || {};
  const academics = application.academicDetails || {};

  if (
    !personal.fullName ||
    !contact.email ||
    !contact.phone ||
    !academics.class10?.board ||
    !academics.class12?.board ||
    !application.coursePreferences?.length
  ) {
    throw new Error(
      "Complete personal, contact, academic, and course details before submitting."
    );
  }

  application.status = "SUBMITTED";

  await application.save();

  return application;
};

module.exports = {
  createApplication,
  getApplication,
  updateApplication,
  submitApplication,
};
