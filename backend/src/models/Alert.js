const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Alert",
    tableName: "alerts",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        terminalID: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        alertType: {
            type: "enum",
            enum: ["Critical", "User-Initiated"],
            nullable: true, // Allow null when rescue is completed
        },
        sentThrough: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        dateTimeSent: {
            type: "timestamp",
            createDate: true,
            update: false
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true,
        },
        status: {
            type: "enum",
            enum: ["Waitlist", "Unassigned", "Dispatched"],
            default: "Unassigned",
            nullable: false,
        },
    },

    relations: {
        terminal: {
            type: "many-to-one",
            target: "Terminal",
            joinColumn: {
                name: "terminalID"
            },
            inverseSide: "alerts"
        },
    },

});