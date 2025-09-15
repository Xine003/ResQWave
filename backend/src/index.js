const express = require("express");
const { AppDataSource } = require("./config/dataSource");
const authRoutes = require("./routes/authRoutes");
const dispatcherRoutes = require("./routes/dispatcherRoutes");
const terminalRoutes = require("./routes/terminalRoutes");
const focalPersonRoutes = require("./routes/focalPersonRoutes");
const communityGroupRoutes = require("./routes/communityGroupRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
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

        // Protect Everything After This
        app.use(authMiddleware);

        // Protected Routes
        app.use("/dispatcher", dispatcherRoutes);
        app.use("/terminal", terminalRoutes);
        app.use("/focalperson", focalPersonRoutes);
        app.use("/communitygroup", communityGroupRoutes);



        app.listen(5000, () => {
            console.log("Server Running at http://localhost:5000");
        });
    })
.catch((err) => console.error("DB Error", err));
