const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Admin",
    tableName: "admins",
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

    hooks: {
        beforeInsert: async (admin) => {
            const repo = require("../dataSource").AppDataSource.getRepository("Admin");

            // Get last admin
            const lastAdmin = await repo
                .createdQueryBuilder("admin")
                .orderBy("admin.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastAdmin) {
                // Extract number part: ADM001
                const lastNumber = parseInt(lastAdmin.id.replace("ADM", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as ADM001
            admin.id = "ADM" + String(newNumber).padStart(3, "0");
        }
    }
});