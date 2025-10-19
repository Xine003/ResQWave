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
            type: Number,
            nullable: false
        },
        noOfResidents: {
            type: Number,
            nullable: false,
        },
        floodSubsideHours: {
            type: Number,
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