const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Result",
    tableName: "results",
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
        timeCompleted: {
            type: "timestamp",
            createDate: true,
            nullable: false
        },
        noOfRescuePersonnel: {
            type: "int",
            nullable: false
        },
        actionTaken: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
    },

    relations: {
        alert: {
            type: "many-to-one",
            target: "Alert",
            joinColumn: {name: "emergencyID"},
            inverseSide: "alerts"
        },
    },

    hooks: {
        beforeInsert: async (result) => {
            const repo = require("../dataSource").AppDataSource.getRepository("Result");

            // Get last result
            const lastResult = await repo
                .createdQueryBuilder("result")
                .orderBy("result.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastResult) {
                // Extract number part: RES001
                const lastNumber = parseInt(lastResult.id.replace("RES", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as RES001
            result.id = "RES" + String(newNumber).padStart(3, "0");
        }
    }
});