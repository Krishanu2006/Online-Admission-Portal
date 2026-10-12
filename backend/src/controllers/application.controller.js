
const applicationService = require("../services/application.service");

const getUserId = (req) => {
  const userId = req.user?.userId;

  if (userId === undefined || userId === null) {
    const error = new Error("Authenticated user ID is missing.");
    error.statusCode = 401;
    throw error;
  }

  return userId;
};

const handleError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? fallbackMessage
        : error.message,
  });
};

const createApplication = async (req, res) => {
  try {
    const userId = getUserId(req);

    const application = await applicationService.createApplication(
      userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Application created successfully.",
      data: application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to create application."
    );
  }
};

const getApplication = async (req, res) => {
  try {
    const userId = getUserId(req);

    const application = await applicationService.getApplication(
      userId
    );

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve application."
    );
  }
};

const updateApplication = async (req, res) => {
  try {
    const userId = getUserId(req);

    const application = await applicationService.updateApplication(
      userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Application updated successfully.",
      data: application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to update application."
    );
  }
};

const submitApplication = async (req, res) => {
  try {
    const userId = getUserId(req);

    const application = await applicationService.submitApplication(
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to submit application."
    );
  }
};

module.exports = {
  createApplication,
  getApplication,
  updateApplication,
  submitApplication,
};
