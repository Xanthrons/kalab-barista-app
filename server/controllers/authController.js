const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET || "kalab-barista-secret",
    {
      expiresIn: "7d"
    }
  );
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    console.log("--- Login Attempt ---");
    console.log("Email from request:", email);
    
    const user = await AdminUser.findOne({ email });

    // if (!user || !user.is_active) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid email or password."
    //   });
    // }

    // const validPassword = await bcrypt.compare(password, user.password_hash);

    // if (!validPassword) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid email or password."
    //   });
    // }

    if (!user) {
      console.log("Result: User not found in DB"); // Check if query works
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    console.log("User found in DB. Comparing passwords...");
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    console.log("Password Valid:", validPassword); // This is the moment of truth

    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    user.last_login_at = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        token: signToken(user),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    data: req.auth.user
  });
}

module.exports = {
  login,
  getCurrentUser
};
