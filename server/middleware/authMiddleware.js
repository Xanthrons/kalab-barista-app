const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "kalab-barista-secret"
    );

    const user = await AdminUser.findById(payload.sub).select("-password_hash");

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer valid."
      });
    }

    req.auth = {
      id: user._id.toString(),
      role: user.role,
      user
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission for this action."
      });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
