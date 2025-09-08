const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
    name: "CommunityGroup",
    tableName: "communitygroups",
    columns: {
        id: {
            type: "varchar",
            primary: true,
        },
        communityGroupName: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        focalPersonID: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        noOfIndividuals: {
            type: "integer",
            nullable: false,
        },
        noOfFamilies: {
            type: "integer",
            nullable: false,
        },
        noOfPWD: {
            type: "integer",
            nullable: false,
        },
        noOfPregnantWomen: {
            type: "integer",
            nullable: false,
        },
        noOfKids: {
            type: "integer",
            nullable: false,
        },
        otherInformation: {
            type: "varchar",
            length: 255,
        },
        coordinates: {
            type: "float",
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
            inverseSide: "focalPersons"
        },
    },

    hooks: {
        beforeInsert: async (communitygroup) => {
            const repo = require("../dataSource").AppDataSource.getRepository("CommunityGroup");

            // Get last community group
            const lastCommunityGroup = await repo
                .createdQueryBuilder("communitygroup")
                .orderBy("communitygroup.id", "DESC")
                .getOne();

            let newNumber = 1;
            if (lastCommunityGroup) {
                // Extract number part: CG001
                const lastNumber = parseInt(last.id.replace("CG", ""), 10);
                newNumber = lastNumber + 1;
            }

            // Format as CG001
            communitygroup.id = "CG" + String(newNumber).padStart(3, "0");
        }
    }
});