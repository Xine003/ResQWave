const { AppDataSource } = require("../config/dataSource");
const { getCache, setCache } = require("../config/cache");

const logRepo = AppDataSource.getRepository("Log");
const focalRepo = AppDataSource.getRepository("FocalPerson");

// GET /logs/own -> returns only the logged-in focal person’s logs
const getOwnLogs = async (req, res) => {
  try {
    const actorID = String(req.user?.focalPersonID || req.user?.id || "");
    if (!actorID) return res.status(401).json({ message: "Unauthorized" });

    const cacheKey = `logs:own:${actorID}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const rows = await logRepo
      .createQueryBuilder("l")
      .where("l.actorID = :id", { id: actorID })
      .orderBy("l.createdAt", "DESC")
      .getMany();

    const focal = await focalRepo.findOne({ where: { id: actorID } });
    const actorName = focal
      ? [focal.firstName, focal.lastName].filter(Boolean).join(" ").trim() || "Focal Person"
      : "Focal Person";

    const lastUpdated = rows[0]?.createdAt || null;

    const byDay = {};
    for (const r of rows) {
      const d = new Date(r.createdAt);
      const dateLabel = d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
      (byDay[dateLabel] ||= []).push({
        time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
        actorName,
        entityType: r.entityType,
        field: r.field,
        oldValue: r.oldValue,
        newValue: r.newValue,
        message: `updated their ${r.entityType.toLowerCase()} information`,
      });
    }

    const days = Object.keys(byDay).map(date => ({
      date,
      count: byDay[date].length,
      entries: byDay[date],
    }));

    const payload = { lastUpdated, days, total: rows.length };
    await setCache(cacheKey, payload, 60);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - READ Own Logs" });
  }
};

module.exports = { getOwnLogs };