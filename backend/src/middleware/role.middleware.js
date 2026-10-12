const authorize = (...allowedRoles) => {
  // Normalize configured roles once when the middleware is created.
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).trim().toUpperCase()
  );

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Support the role claim used by the JWT, with userType as a fallback.
    const userRole = String(
      req.user.role ?? req.user.userType ?? ""
    )
      .trim()
      .toUpperCase();

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    return next();
  };
};

module.exports = authorize;