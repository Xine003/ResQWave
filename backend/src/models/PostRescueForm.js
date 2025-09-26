const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "PostRescueForm",
    tableName: "postrescueforms",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true
        },
        alertID: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        noOfPersonnelDeployed: {
            type: "int",
            nullable: false
        },
        resourcesUsed: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        actionTaken: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
            update: false
        },
        completedAt: {
            type: "timestamp",
            updateDate: true,
        }
    },
    relations: {
        alerts: {
            type: "one-to-one",
            target: "Alert",
            joinColumn: {name: "alertID", referenceColumn: "id" },
            onDelete: "CASCADE"
        }
    }
});