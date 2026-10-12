
const adminApplicationService = require("../services/admin.application.service");

const getApplications = async (req, res) => {
  try {
    const applications =
      await adminApplicationService.getApplications();

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Failed to fetch applications:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application =
      await adminApplicationService.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Failed to fetch application:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body;

    const application =
      await adminApplicationService.updateApplicationStatus(
        applicationId,
        status,
        rejectionReason,
        req.user?.userId ?? null
      );

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
};
