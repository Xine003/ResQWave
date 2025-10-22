const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Neighborhood",
    tableName: "neighborhood",
    columns: {
        id: {
            type: "varchar",
            length: 40,
            primary: true
        },
        focalPersonID: {
            type: "varchar",
            length: 40,
            nullable: true
        },
        terminalID: {
            type: "varchar",
            length: 40,
            nullable: true
        },
        noOfHouseholds: {
            type: "varchar",
            length: 32,
            nullable: false
        },
        noOfResidents: {
            type: "varchar",
            length: 32,
            nullable: false,
        },
        floodSubsideHours: {
            type: "varchar",
            length: 32,
            nullable: true
        },
        hazards: {
            type: "text",
            nullable: true
        },
        otherInformation: {
            type: "text",
            nullable: true
        },
        archived: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: "datetime",
            createDate: true,
            update: false,
        },
        updatedAt: {
            type: "datetime",
            createDate: true,
            update: true
        },
    },
});