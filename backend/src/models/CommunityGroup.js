const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "CommunityGroup",
    tableName: "communitygroups",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        communityGroupName: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        terminalID: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        noOfIndividuals: {
            type: "integer",
            nullable: false,
        },
        noOfFamilies: {
            type: "integer",
            nullable: false,
        },
        noOfPWD: {
            type: "integer",
            nullable: false,
        },
        noOfPregnantWomen: {
            type: "integer",
            nullable: false,
        },
        noOfSeniors: {
            type: "integer",
            nullable: false
        },
        noOfKids: {
            type: "integer",
            nullable: false,
        },
        otherInformation: {
            type: "varchar",
            length: 255,
        },
        address: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        boundary: {
            type: "json",
            nullable: false,
        },
        coordinates: {
            // Store array of floats as JSON (e.g., [lat, lng])
            type: "simple-json",
            nullable: false,
        },
        archived: {
            type: "boolean",
            default: false,
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
            update: false
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true,
        }
    },

    relations: {
        terminal: {
            target: "Terminal",
            type: "one-to-one",
            joinColumn: {name: "terminalID"},
            inverseSide: "terminals",
            onDelete: "CASCADE"
        },
    },
});