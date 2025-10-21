const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "FocalPerson",
    tableName: "focalpersons",
    columns: {
        id: { 
            type: "varchar", 
            length: 40, 
            primary: true 
        }, // e.g., FP001

        // Identity
        firstName: { 
            type: "varchar", 
            length: 80, 
            nullable: false 
        },
        lastName: { 
            type: "varchar", 
            length: 80, 
            nullable: false 
        },

        // Contact
        email: { 
            type: "varchar", 
            length: 255, 
            nullable: true 
        },
        contactNumber: { 
            type: "varchar", 
            length: 40, 
            nullable: true 
        },

        // Auth (hashed)
        password: { 
            type: "varchar", 
            length: 255, 
            nullable: false 
        },

        // Address/Location (string or JSON string)
        address: { 
            type: "text", 
            nullable: true 
        },

        // Photos
        photo: { 
            type: "longblob", 
            nullable: true 
        },
        alternativeFPImage: { 
            type: "longblob", 
            nullable: true 
        },

        // Alternative focal person
        altFirstName: { 
            type: "varchar", 
            length: 255, 
            nullable: true 
        },
        altLastName: { 
            type: "varchar", 
            length: 255, 
            nullable: true 
        },
        altEmail: { 
            type: "varchar", 
            length: 255, 
            nullable: true 
        },
        altContactNumber: { 
            type: "varchar", 
            length: 40, 
            nullable: true 
        },

        approvedBy: { 
            type: "varchar", 
            length: 255, 
            nullable: true 
        },

        archived: { 
            type: "boolean", 
            default: false 
        },

        createdAt: { 
            type: "timestamp", 
            createDate: true, 
            update: false 
        },
        updatedAt: { 
            type: "timestamp", 
            updateDate: true 
        },
    },
});