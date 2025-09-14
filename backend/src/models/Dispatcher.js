
const { EntitySchema } = require("typeorm");


module.exports = new EntitySchema ({
    name: "Dispatcher",
    tableName: "dispatchers",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        name: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        email: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        contactNumber: {
            type: "integer",
            nullable: false
        },
        password: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        createdBy: {
            type: "varchar",
            length: 255,
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
        },
        updatedAt: {
            type: "timestamp",
            createDate: true,
        },
        archived: {
            type: "boolean",
            default: false,
        },
    },
    relations: {
        admin: {
            type: "many-to-one",
            target: "Admin",
            joinColumn: {
                name: "createdBy"
            },
            inverseSide: "dispatchers"
        }
    },

});