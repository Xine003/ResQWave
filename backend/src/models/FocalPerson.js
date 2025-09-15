const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "FocalPerson",
    tableName: "focalpersons",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        communityGroupID: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        photo: {
            type: "blob",
            nullable: true,
        },
        name: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        contactNumber: {
            type: "integer",
            nullable: false
        },
        address: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        alternativeFP: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        alternativeFPImage: {
            type: "blob",
            nullable: true,
        },
        alternativeFPContactNumber: {
            type: "integer",
            nullable: false,
        },
        createdBy: {
            type: "varchar",
            length: 255,
        },
        archived: {
            type: "boolean",
            default: false,
        }
    },

    relations: {
        communityGroup: {
            target: "CommunityGroup",
            type: "one-to-one",
            joinColumn: {name: "communityGroupID"},
            inverseSide: "communityGroups",
            onDelete: "CASCADE"
        },
    },
});