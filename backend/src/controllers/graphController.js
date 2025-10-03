// controllers/alertStatsController.js
const { Between } = require("typeorm");
const dayjs = require("dayjs");
const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const {
  getCache,
  setCache,
} = require("../config/cache");

const getAlertStats = async (req, res) => {
  try {
    const { type } = req.query; // daily | weekly | monthly | yearly
    
    // Cache Check
    const cacheKey = `alertStats:${type}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const now = dayjs();
    let startDate, endDate;

    switch (type) {
      case "daily":
        startDate = now.startOf("day").subtract(6, "day"); // last 7 days
        endDate = now.endOf("day");
        break;

      case "weekly":
        startDate = now.startOf("week").subtract(3, "week"); // last 4 weeks
        endDate = now.endOf("week");
        break;

      case "monthly":
        startDate = now.startOf("month").subtract(2, "month"); // last 3 months
        endDate = now.endOf("month");
        break;

      case "yearly":
        startDate = now.startOf("year").subtract(11, "month"); // last 12 months
        endDate = now.endOf("year");
        break;

      default:
        return res.status(400).json({ error: "Invalid type parameter" });
    }

    // fetch alerts from DB
    const alerts = await alertRepo.find({
      where: {
        dateTimeSent: Between(startDate.toDate(), endDate.toDate())
      }
    });

    const stats = {};
    for (const alert of alerts) {
      let groupKey;
      if (type === "daily") {
        groupKey = dayjs(alert.dateTimeSent).format("YYYY-MM-DD");
      } else if (type === "weekly") {
        groupKey = dayjs(alert.dateTimeSent).format("YYYY-MM-DD");
      } else if (type === "monthly") {
        const weekStart = dayjs(alert.dateTimeSent).startOf("week").format("MMM D");
        const weekEnd = dayjs(alert.dateTimeSent).endOf("week").format("D");
        groupKey = `${weekStart}-${weekEnd}`;
      } else {
        groupKey = dayjs(alert.dateTimeSent).format("MMMM");
      }
      if (!stats[groupKey]) stats[groupKey] = { userInitiated: 0, critical: 0 };
      if (alert.alertType === "User-Initiated") stats[groupKey].userInitiated++;
      else if (alert.alertType === "Critical") stats[groupKey].critical++;
    }

    const payload = { type, stats };

    // TTL Selection
    const ttlSeconds = 
    type === "daily" ? 30 :
    type === "weekly" ? 45 :
    type === "monthly" ? 120:
    300;

    await setCache(cacheKey, payload, ttlSeconds);
    return res.json({ type, stats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getAlertStats };
