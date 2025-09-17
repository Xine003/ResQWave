const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Result",
    tableName: "results",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        emergencyID: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        timeCompleted: {
            type: "timestamp",
            createDate: true,
            nullable: false
        },
        noOfRescuePersonnel: {
            type: "int",
            nullable: false
        },
        actionTaken: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
    },

    relations: {
        alert: {
            type: "many-to-one",
            target: "Alert",
            joinColumn: {name: "emergencyID"},
            inverseSide: "alerts"
        },
    },

});