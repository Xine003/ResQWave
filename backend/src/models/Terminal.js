const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Terminal",
    tableName: "terminals",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        dateCreated: {
            type: "timestamp",
            createDate: true,
        },
        dateUpdated: {
            type: "timestamp",
            createDate: true,
        },
        status: {
            type: "enum",
            enum: ["Online", "Offline"],
            default: "Offline",
        },
        archived: {
            type: "boolean",
            default: false,
        },
        availability: {
            type: "enum",
            enum: ["Available", "Occupied"],
            default: "Available",
        }
    },
});