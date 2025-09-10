const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "RescueForm",
    tableName: "rescueforms",
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
        dispatcherID: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        focalPersonID: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        waterLevel: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        urgencyOfEvacuation: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        hazardPresent: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        accessibility: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        resourceNeeds: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        otherInformation: {
            type: "varchar",
            length: 255,
            nullable: false,
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
            type: "one-to-one",
            target: "Dispatcher",
            joinColumn: {
                name: "dispatcherID"
            },
            inverseSide: "dispatchers"
        },
        focalPerson: {
            type: "one-to-one",
            target: "FocalPerson",
            joinColumn: {
                name: "focalPersonID"
            },
            inverseSide: "focalpersons"
        },
    },

    hooks: {
        beforeInsert: async (rescueform) => {
            const repo = require("../dataSource").AppDataSource.getRepository("RescueForm");

            // Get last result
            const lastRescueForm = await repo
                .createdQueryBuilder("rescueForm")
                .orderBy("rescueform.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastRescueForm) {
                // Extract number part: RES001
                const lastNumber = parseInt(lastRescueForm.id.replace("RESQF", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as RES001
            rescueform.id = "RESQF" + String(newNumber).padStart(3, "0");
        }
    }
});