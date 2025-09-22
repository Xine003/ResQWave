const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "ResetPassword",
    tableName: "resetpassword",
    columns: {
        id: {
            type: "integer",
            primary: true,
            generated: true
        },
        userID: {
            type: "varchar",
            nullable: false
        },
        userType: {
            type: "enum",
            enum: ["Focal", "Dispatcher"],
            nullable: false
        },
        code: {
            type: "varchar",
            length: 6,
            nullable: false
        },
        expiry: {
            type: "timestamp",
            nullable: false
        },
    },
});