const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Admin",
    tableName: "admins",
    columns: {
        id: {
            type: "varchar",
            primary: true,
            generated: false,
        },
        name: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        password: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
        },
    },
});