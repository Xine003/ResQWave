const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Respond",
    tableName: "responds",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        emergencyID:  {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        receivedBy: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        emergencyNote: {
            type: "varchar",
            length: 255,
        },
    },

    relations: {
        alert: {
            type: "one-to-one",
            target: "Alert",
            joinColumn: {
                name: "emergencyID"
            },
            inverseSide: "alerts"
        },
        dispatcher: {
            type: "many-to-one",
            target: "Dispatcher",
            joinColumn: {
                name: "receivedBy"
            },
            inverseSide: "dispatchers"
        }
    },

});