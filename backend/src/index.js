const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { AppDataSource } = require("./config/dataSource");
const authRoutes = require("./routes/authRoutes");
const resetPasswordRoutes = require("./routes/resetPasswordRoutes");
const dispatcherRoutes = require("./routes/dispatcherRoutes");
const terminalRoutes = require("./routes/terminalRoutes");
const focalPersonRoutes = require("./routes/focalPersonRoutes");
const communityGroupRoutes = require("./routes/communityGroupRoutes");
const {authMiddleware, requireRole} = require("./middleware/authMiddleware");

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

//Connect DB
AppDataSource.initialize()
    .then(() => {
        console.log("Database Connected and Synced!");

        // test route
        app.get("/", (req, res) => {
            res.send("ResQWave Backend Running");
        });

        // Public Routes
        app.use ("/", authRoutes);
        app.use ("/", resetPasswordRoutes);

        // Protect Everything After This
        app.use(authMiddleware);

        // Protected Routes
        // Only Admin can access Dispatcher Management
        app.use("/dispatcher", requireRole("admin"), dispatcherRoutes);
        app.use("/terminal", requireRole("admin", "dispatcher"), terminalRoutes);
        app.use("/focalperson", focalPersonRoutes);
        app.use("/communitygroup", communityGroupRoutes);



        app.listen(5000, () => {
            console.log("Server Running at http://localhost:5000");
        });
    })
.catch((err) => console.error("DB Error", err));