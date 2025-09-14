const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "FocalPerson",
    tableName: "focalpersons",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        terminalID: {
            type: "varchar",
            length: 255,
            unique: true,
            nullable: true,
        },
        photo: {
            type: "blob",
            nullable: true,
        },
        name: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        contactNumber: {
            type: "integer",
            nullable: false
        },
        address: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        alternativeFP: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        alternativeFPImage: {
            type: "blob",
            nullable: true,
        },
        alternativeFPContactNumber: {
            type: "integer",
            nullable: false,
        },
        createdBy: {
            type: "varchar",
            length: 255,
        }

    },

    relations: {
        terminal: {
            target: "Terminal",
            type: "one-to-one",
            joinColumn: {name: "terminalID"},
            inverseSide: "terminals"
        },
    },

    hooks: {
        beforeInsert: async (focalperson) => {
            const repo = require("../dataSource").AppDataSource.getRepository("focalperson");

            // Get last focalperson
            const lastFocalPerson = await repo
                .createdQueryBuilder("focalperson")
                .orderBy("focalperson.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastFocalPerson) {
                // Extract number part: FCP001
                const lastNumber = parseInt(lastFocalPerson.id.replace("FCP", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as FCP001
            focalperson.id = "FCP" + String(newNumber).padStart(3, "0");
        }
    }
});