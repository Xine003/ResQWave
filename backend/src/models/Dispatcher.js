
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

    hooks: {
        beforeInsert: async (dispatcher) => {
            const repo = require("../dataSource").AppDataSource.getRepository("Dispatcher");

            // Get last admin
            const lastDispatcher = await repo
                .createdQueryBuilder("dispatcher")
                .orderBy("dispatcher.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastDispatcher) {
                // Extract number part: DIS001
                const lastNumber = parseInt(lastDispatcher.id.replace("DIS", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as DIS001
            dispatcher.id = "DIS" + String(newNumber).padStart(3, "0");
        }
    }
});