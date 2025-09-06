const express = require("express");
const { AppDataSource } = require("./config/dataSource");

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

        app.listen(5000, () => {
            console.log("Server Running at http://localhost:5000");
        });
    })
.catch((err) => console.error("DB Error", err));
