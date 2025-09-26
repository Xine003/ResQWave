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
            default: false
        },
        waterLevel: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        urgencyOfEvacuation: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        hazardPresent: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        accessibility: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        resourceNeeds: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        otherInformation: {
            type: "varchar",
            length: 255,
            nullable: true,
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