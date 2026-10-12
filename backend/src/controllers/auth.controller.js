const bcrypt = require("bcryptjs");
const authService = require("../services/auth.service");
const passwordService = require("../services/password.service");
const User = require("../models/mysql/User");

const register = async (req, res) => {
  try {
    const user = await authService.registerStudent(req.body || {});

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body || {});

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Student login failed:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const result = await authService.loginAdmin(req.body || {});

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: result,
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message || "Admin login failed.",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordStatus = await passwordService.getPasswordStatus(
      user.id
    );

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        user_id: user.user_id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        mobile: user.mobile || user.phone_number,
        role: user.role,
        is_active: Boolean(user.is_active),
        mustChangePassword: passwordStatus.mustChangePassword,
        passwordChangedAt: passwordStatus.passwordChangedAt,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 12 characters long.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can use this password-change page.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    if (!user.password_hash) {
      return res.status(500).json({
        success: false,
        message: "The account password could not be verified.",
      });
    }

    const currentMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!currentMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (!user.user_id) {
      console.error("Public user ID is missing for account:", user.id);

      return res.status(500).json({
        success: false,
        message: "Unable to identify the account for audit records.",
      });
    }

    const result = await passwordService.changePassword(
      user.id,
      newPassword,
      user.user_id
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        mustChangePassword: false,
      },
    });
  } catch (error) {
    const clientErrors = {
      "Password must be at least 12 characters long.": 400,
      "You cannot reuse any of your last five passwords.": 400,
      "User not found.": 404,
      "Invalid password-change audit identity.": 400,
    };

    if (clientErrors[error.message]) {
      return res.status(clientErrors[error.message]).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password. Please try again.",
    });
  }
};

module.exports = {
  register,
  login,
  loginAdmin,
  getMe,
  changePassword,
};