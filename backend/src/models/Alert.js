const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Alert",
    tableName: "alerts",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        terminalID: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        alertType: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        sentThrough: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        dateTimeSent: {
            type: "timestamp",
            createDate: true,
        },
        status: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
    },

    hooks: {
        beforeInsert: async (alert) => {
            const repo = require("../dataSource").AppDataSource.getRepository("Alert");

            // Get last alert
            const lastAlert = await repo
                .createdQueryBuilder("alert")
                .orderBy("alert.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastAlert) {
                // Extract number part: ALE001
                const lastNumber = parseInt(lastAlert.id.replace("ALE", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as ALE001
            alert.id = "ALE" + String(newNumber).padStart(3, "0");
        }
    }
});