const { AppDataSource } = require("../config/dataSource");
const { getCache, setCache } = require("../config/cache");

const terminalRepo = AppDataSource.getRepository("Terminal");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const neighborhoodRepo = AppDataSource.getRepository("Neighborhood");
const alertRepo = AppDataSource.getRepository("Alert");
const postRescueRepo = AppDataSource.getRepository("PostRescueForm");

const getAdminDashboardStats = async (req, res) => {
    try {
        const cacheKey = "adminDashboardStats";
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // 1. Active Terminals
        const activeTerminals = await terminalRepo.count({
            where: { archived: false }
        });

        // 2. Active Dispatchers
        const activeDispatchers = await dispatcherRepo.count({
            where: { archived: false }
        });

        // 3. Active Neighborhoods
        const activeNeighborhoods = await neighborhoodRepo.count({
            where: { archived: false }
        });

        // 4. Completed Operations (Alerts with Post Rescue Form)
        // We count all post rescue forms as they represent completed operations
        const completedOperations = await postRescueRepo.count();

        // 5. Alert Types
        const criticalAlerts = await alertRepo.count({
            where: { alertType: "Critical" }
        });

        const userInitiatedAlerts = await alertRepo.count({
            where: { alertType: "User-Initiated" }
        });

        const payload = {
            payload: {
                activeTerminals,
                activeDispatchers,
                activeNeighborhoods,
                completedOperations,
                alertTypes: {
                    critical: criticalAlerts,
                    userInitiated: userInitiatedAlerts,
                    total: criticalAlerts + userInitiatedAlerts
                }
            }
        };

        await setCache(cacheKey, payload, 300);

        return res.json(payload);

    } catch (err) {
        console.error("Error fetching admin dashboard stats:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getAdminDashboardStats
};
