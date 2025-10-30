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


    // Group by day, then by createdAt (up to the second)
    const byDay = {};
    for (const r of rows) {
      const d = new Date(r.createdAt);
      const dateLabel = d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
      // Format createdAt up to the second (YYYY-MM-DD HH:mm:ss)
      const createdAtSec = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0') + " " + String(d.getHours()).padStart(2, '0') + ":" + String(d.getMinutes()).padStart(2, '0') + ":" + String(d.getSeconds()).padStart(2, '0');
      if (!byDay[dateLabel]) byDay[dateLabel] = {};
      if (!byDay[dateLabel][createdAtSec]) byDay[dateLabel][createdAtSec] = [];
      byDay[dateLabel][createdAtSec].push({
        time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
        actorName,
        entityType: r.entityType,
        field: r.field,
        oldValue: r.oldValue,
        newValue: r.newValue,
        message: `updated their ${r.entityType.toLowerCase()} information`,
        createdAt: createdAtSec,
      });
    }

    // Convert to array structure for frontend
    const days = Object.keys(byDay).map(date => {
      const actions = Object.keys(byDay[date])
        .sort()
        .reverse()
        .map(createdAtSec => {
          const fields = byDay[date][createdAtSec];
          return {
            time: fields[0].time,
            actorName: fields[0].actorName,
            entityType: fields[0].entityType,
            message: fields[0].message,
            createdAt: createdAtSec,
            fields: fields.map(f => ({
              field: f.field,
              oldValue: f.oldValue,
              newValue: f.newValue,
            })),
          };
        });
      return {
        date,
        count: actions.reduce((acc, a) => acc + a.fields.length, 0),
        actions,
      };
    });

    const payload = { lastUpdated, days, total: rows.length };
    await setCache(cacheKey, payload, 60);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - READ Own Logs" });
  }
};

module.exports = { getOwnLogs };