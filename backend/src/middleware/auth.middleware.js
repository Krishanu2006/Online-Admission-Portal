
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      success: false,
      message: "Authentication service is not configured.",
    });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const decoded = jwt.verify(token, secret);

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authenticate;
