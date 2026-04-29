const Registration = require("../models/Registration");

async function getFinancialSummary(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [summary] = await Registration.aggregate([
      {
        $facet: {
          total: [
            { $match: { payment_status: "paid" } },
            { $group: { _id: null, revenue: { $sum: "$price" }, count: { $sum: 1 } } }
          ],
          monthly: [
            { $match: { payment_status: "paid", updatedAt: { $gte: startOfMonth } } },
            { $group: { _id: null, revenue: { $sum: "$price" } } }
          ]
        }
      }
    ]);

    const totalRevenue = summary.total[0]?.revenue || 0;
    const totalPaid = summary.total[0]?.count || 0;
    const monthlyRevenue = summary.monthly[0]?.revenue || 0;
    const avgPerStudent = totalPaid > 0 ? Math.round(totalRevenue / totalPaid) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue,
        avg_per_student: avgPerStudent,
        total_paid_students: totalPaid
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getRevenueStats(req, res, next) {
  try {
    const period = req.query.period || "monthly";
    const now = new Date();
    let groupId, matchFrom, points;

    if (period === "daily") {
      // Last 14 days
      matchFrom = new Date(now);
      matchFrom.setDate(matchFrom.getDate() - 13);
      groupId = { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" }, day: { $dayOfMonth: "$updatedAt" } };
      points = 14;
    } else if (period === "weekly") {
      // Last 12 weeks
      matchFrom = new Date(now);
      matchFrom.setDate(matchFrom.getDate() - 83);
      groupId = { year: { $year: "$updatedAt" }, week: { $week: "$updatedAt" } };
      points = 12;
    } else {
      // Last 12 months
      matchFrom = new Date(now);
      matchFrom.setMonth(matchFrom.getMonth() - 11);
      matchFrom.setDate(1);
      groupId = { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" } };
      points = 12;
    }

    const raw = await Registration.aggregate([
      { $match: { payment_status: "paid", updatedAt: { $gte: matchFrom } } },
      { $group: { _id: groupId, amount: { $sum: "$price" } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ]);

    // Build full series with zeroes for empty periods
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const data = [];

    if (period === "monthly") {
      for (let i = points - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear(), m = d.getMonth() + 1;
        const found = raw.find(r => r._id.year === y && r._id.month === m);
        data.push({ label: `${monthNames[m-1]} ${y}`, amount: found?.amount || 0 });
      }
    } else if (period === "weekly") {
      for (let i = points - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const week = getWeekNumber(d);
        const found = raw.find(r => r._id.year === d.getFullYear() && r._id.week === week);
        data.push({ label: `W${week}`, amount: found?.amount || 0 });
      }
    } else {
      for (let i = points - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
        const found = raw.find(r => r._id.year === y && r._id.month === m && r._id.day === day);
        data.push({ label: `${m}/${day}`, amount: found?.amount || 0 });
      }
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

async function getConversionStats(req, res, next) {
  try {
    const [result] = await Registration.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          interested: { $sum: { $cond: [{ $eq: ["$interest_status", "interested"] }, 1, 0] } },
          payment_sent: { $sum: { $cond: [{ $gt: ["$price", 0] }, 1, 0] } },
          enrolled: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] } }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: result || { total: 0, interested: 0, payment_sent: 0, enrolled: 0 }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getFinancialSummary, getRevenueStats, getConversionStats };
