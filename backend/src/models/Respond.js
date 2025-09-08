const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Respond",
    tableName: "responds",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        emergencyID:  {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        receivedBy: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        emergencyNote: {
            type: "varchar",
            length: 255,
        },
    },

    relations: {
        alert: {
            type: "one-to-one",
            target: "Alert",
            joinColumn: {
                name: "emergencyID"
            },
            inverseSide: "alerts"
        },
        dispatcher: {
            type: "many-to-one",
            target: "Dispatcher",
            joinColumn: {
                name: "receivedBy"
            },
            inverseSide: "dispatchers"
        }
    },

    hooks: {
        beforeInsert: async (respond) => {
            const repo = require("../dataSource").AppDataSource.getRepository("Respond");

            // Get last respond
            const lastRespond = await repo
                .createdQueryBuilder("respond")
                .orderBy("respond.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastRespond) {
                // Extract number part: RES001
                const lastNumber = parseInt(lastRespond.id.replace("RES", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as RES001
            respond.id = "RES" + String(newNumber).padStart(3, "0");
        }
    }
});