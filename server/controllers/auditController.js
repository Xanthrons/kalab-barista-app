const AuditLog = require("../models/AuditLog");

async function getAuditLogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 30);
    const skip = (page - 1) * limit;
    const { search, action } = req.query;

    const filter = {};
    if (action && action !== "all") {
      filter.action = new RegExp(action, "i");
    }
    if (search && search.trim()) {
      const p = new RegExp(search.trim(), "i");
      filter.$or = [
        { actor_name: p },
        { action: p },
        { description: p }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAuditLogs };
