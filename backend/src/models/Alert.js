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
            type: "varchar",
            length: 255,
            nullable: false,
        },
        sentThrough: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        dateTimeSent: {
            type: "timestamp",
            createDate: true,
        },
        status: {
            type: "enum",
            enum: ["Critical", "User-Initiated"],
        },
    },

    relations: {
        terminal: {
            type: "many-to-one",
            target: "Terminal",
            joinColumn: {
                name: "terminalID"
            },
            inverseSide: "terminals"
        },
    },

});