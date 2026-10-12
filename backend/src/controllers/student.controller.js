const studentService = require("../services/student.service");

const getProfile = async (req, res) => {
  try {
    const profile = await studentService.getProfile(
      req.user.userId
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Failed to fetch student profile:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await studentService.updateProfile(
      req.user.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getApplicationStatus = async (req, res) => {
  try {
    const status = await studentService.getApplicationStatus(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getApplicationStatus,
};