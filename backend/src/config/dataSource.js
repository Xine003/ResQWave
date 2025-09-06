const { DataSource } = require("typeorm");
require("reflect-metadata");

const AppDataSource = new DataSource ({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "resqwave",
    synchronize: true, // auto create/update for tables
    logging: true,
    entities: [
        __dirname + "/../models/*.js" // load all models in models
    ],
});

module.exports = { AppDataSource }