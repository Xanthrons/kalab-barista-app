const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");
const audit = require("../utils/audit");

async function getAdminUsers(req, res, next) {
  try {
    const users = await AdminUser.find({}).sort({ role: 1, createdAt: -1 }).select("-password_hash");
    return res.status(200).json({ success: true, data: users });
  } catch (error) { return next(error); }
}

async function createAdminUser(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "admin");

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    if (!["admin", "super_admin"].includes(role))
      return res.status(400).json({ success: false, message: "Role must be admin or super_admin." });

    const existing = await AdminUser.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "An admin with this email already exists." });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await AdminUser.create({ name, email, password_hash, role });

    await audit.log({ req, action: "user_management.create", description: `Created ${role} "${name}" (${email})`, target_type: "admin_user", target_id: user._id });

    return res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role, is_active: user.is_active } });
  } catch (error) { return next(error); }
}

async function updateAdminUser(req, res, next) {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Admin user not found." });

    // Super admin cannot deactivate themselves
    if (req.body.is_active === false && req.auth.id === user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
    }

    if (req.body.name !== undefined) user.name = String(req.body.name || "").trim() || user.name;
    if (req.body.role !== undefined && ["admin", "super_admin"].includes(req.body.role)) user.role = req.body.role;
    if (req.body.is_active !== undefined) user.is_active = Boolean(req.body.is_active);

    await user.save();
    await audit.log({ req, action: "user_management.update", description: `Updated admin "${user.name}" — active: ${user.is_active}, role: ${user.role}`, target_type: "admin_user", target_id: user._id });

    return res.status(200).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role, is_active: user.is_active } });
  } catch (error) { return next(error); }
}

async function resetAdminPassword(req, res, next) {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Admin user not found." });

    const newPassword = String(req.body.new_password || "").trim();
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await audit.log({ req, action: "user_management.password_reset", description: `Password reset for admin "${user.name}" (${user.email})`, target_type: "admin_user", target_id: user._id });

    return res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) { return next(error); }
}

async function deleteAdminUser(req, res, next) {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Admin user not found." });
    if (req.auth.id === user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });

    await user.deleteOne();
    await audit.log({ req, action: "user_management.delete", description: `Deleted admin "${user.name}" (${user.email})`, target_type: "admin_user", target_id: user._id });

    return res.status(200).json({ success: true, message: "Admin user deleted." });
  } catch (error) { return next(error); }
}

module.exports = { getAdminUsers, createAdminUser, updateAdminUser, resetAdminPassword, deleteAdminUser };
