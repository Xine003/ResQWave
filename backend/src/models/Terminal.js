const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "Terminal",
    tableName: "terminals",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        focalPersonID: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        dateCreated: {
            type: "timestamp",
            createDate: true,
        },
        dateUpdated: {
            type: "timestamp",
            createDate: true,
        },
        status: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
    },
    relations: {
        focalPerson: {
            type: "one-to-one",
            target: "FocalPerson",
            joinColumn: {
                name: "focalPersonID"
            },
            inverseSide: "terminal"
        },
    },

    hooks: {
        beforeInsert: async (terminal) => {
            const repo = require("../dataSource").AppDataSource.getRepository("Terminal");

            // Get last terminal
            const lastTerminal = await repo
                .createdQueryBuilder("terminal")
                .orderBy("terminal.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastTerminal) {
                // Extract number part: RESQ001
                const lastNumber = parseInt(lastTerminal.id.replace("RESQ", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as RESQ001
            terminal.id = "RESQ" + String(newNumber).padStart(3, "0");
        }
    }
});