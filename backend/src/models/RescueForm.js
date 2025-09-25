const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "RescueForm",
    tableName: "rescueforms",
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
        focalUnreachable: {
            type: "boolean",
        },
        waterLevel: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        urgencyOfEvacuation: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        hazardPresent: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        accessibility: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        resourceNeeds: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        otherInformation: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
    },

    relations: {
        alert: {
            type: "one-to-one",
            target: "Alert",
            joinColumn: {
                name: "emergencyID"
            },
            inverseSide: "rescueForms"
        },
    },
});