import type { CommunityGroup, CommunityGroupDetails } from "../types";

// Predefined community groups data that matches the visualization signals
export const predefinedCommunityGroups: CommunityGroup[] = [
    {
        id: "RSQW-101",
        name: "PAMAKAI",
        status: "OFFLINE",
        focalPerson: "Marites Dela Cruz",
        contactNumber: "+63 912 345 6789",
        address: "Block 2, Lot 5, Rizal St.",
        registeredAt: "September 3, 2025"
    },
    {
        id: "RSQW-102",
        name: "PENTUNAI HOA",
        status: "ONLINE",
        focalPerson: "Gwen Uy",
        contactNumber: "+63 912 345 6790",
        address: "Lot 11, Paraiso Rd.",
        registeredAt: "September 7, 2025"
    },
    {
        id: "RSQW-103",
        name: "BAYBAYIN",
        status: "ONLINE",
        focalPerson: "Ana Santos",
        contactNumber: "+63 912 345 6791",
        address: "Corner Gen. Luna & Mabini",
        registeredAt: "September 12, 2025"
    },
    {
        id: "RSQW-001",
        name: "Lerandia Subdivision",
        status: "ONLINE",
        focalPerson: "Gwyneth Uy",
        contactNumber: "+63 912 345 6792",
        address: "Block 1, Lot 17, Paraiso Rd, 1400",
        registeredAt: "September 9, 2025"
    }
];

// Detailed community group information for more info functionality
export const predefinedCommunityGroupDetails: { [key: string]: CommunityGroupDetails } = {
    "RSQW-101": {
        name: "PAMAKAI",
        terminalId: "RSQW-101",
        communityId: "CGP-001",
        individuals: 156,
        families: 42,
        kids: 38,
        seniors: 12,
        pwds: 8,
        pregnantWomen: 3,
        notableInfo: [
            "Prone to flooding during heavy rains",
            "Limited access road during peak hours",
            "Community center available for emergency gathering"
        ],
        address: "Block 2, Lot 5, Rizal St.",
        coordinates: [121.03197820799186, 14.772888009898285],
        boundary: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: [
                    [121.0315, 14.7732],
                    [121.0325, 14.7732],
                    [121.0325, 14.7725],
                    [121.0315, 14.7725],
                    [121.0315, 14.7732]
                ]
            }
        },
        focalPerson: {
            name: "Marites Dela Cruz",
            photo: "/images/focal-persons/marites.jpg",
            contactNumber: "+63 912 345 6789",
            email: "marites.delacruz@gmail.com",
            houseAddress: "Block 2, Lot 5, Rizal St.",
            coordinates: "14.772888, 121.031978"
        },
        alternativeFocalPerson: {
            altName: "Rodel Sustiguer",
            altContactNumber: "+63 912 345 6790",
            altEmail: "rodel.sustiguer@gmail.com"
        }
    },
    "RSQW-102": {
        name: "PENTUNAI HOA",
        terminalId: "RSQW-102",
        communityId: "CGP-002",
        individuals: 284,
        families: 78,
        kids: 67,
        seniors: 23,
        pwds: 15,
        pregnantWomen: 6,
        notableInfo: [
            "Active homeowners association",
            "Well-maintained community facilities",
            "Regular community drills conducted"
        ],
        address: "Lot 11, Paraiso Rd.",
        coordinates: [121.04440528679821, 14.776897515717772],
        boundary: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: [
                    [121.0440, 14.7772],
                    [121.0450, 14.7772],
                    [121.0450, 14.7765],
                    [121.0440, 14.7765],
                    [121.0440, 14.7772]
                ]
            }
        },
        focalPerson: {
            name: "Gwen Uy",
            photo: "/images/focal-persons/gwen.jpg",
            contactNumber: "+63 912 345 6790",
            email: "gwen.uy@gmail.com",
            houseAddress: "Lot 11, Paraiso Rd.",
            coordinates: "14.776898, 121.044405"
        },
        alternativeFocalPerson: {
            altName: "Jose Ramos",
            altContactNumber: "+63 912 345 6791",
            altEmail: "jose.ramos@gmail.com"
        }
    },
    "RSQW-103": {
        name: "BAYBAYIN",
        terminalId: "RSQW-103",
        communityId: "CGP-003",
        individuals: 198,
        families: 54,
        kids: 45,
        seniors: 18,
        pwds: 12,
        pregnantWomen: 4,
        notableInfo: [
            "Historic community with cultural significance",
            "Near main commercial district",
            "Good access to medical facilities"
        ],
        address: "Corner Gen. Luna & Mabini",
        coordinates: [121.039008311252, 14.768014818600191],
        boundary: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: [
                    [121.0385, 14.7684],
                    [121.0395, 14.7684],
                    [121.0395, 14.7677],
                    [121.0385, 14.7677],
                    [121.0385, 14.7684]
                ]
            }
        },
        focalPerson: {
            name: "Ana Santos",
            photo: "/images/focal-persons/ana.jpg",
            contactNumber: "+63 912 345 6791",
            email: "ana.santos@gmail.com",
            houseAddress: "Corner Gen. Luna & Mabini",
            coordinates: "14.768015, 121.039008"
        },
        alternativeFocalPerson: {
            altName: "Lito Perez",
            altContactNumber: "+63 912 345 6792",
            altEmail: "lito.perez@gmail.com"
        }
    },
    "RSQW-001": {
        name: "Lerandia Subdivision",
        terminalId: "RSQW-001",
        communityId: "CGP-004",
        individuals: 320,
        families: 89,
        kids: 78,
        seniors: 28,
        pwds: 18,
        pregnantWomen: 7,
        notableInfo: [
            "Main community with emergency coordination center",
            "Primary evacuation site for surrounding areas",
            "Advanced warning system installed"
        ],
        address: "Block 1, Lot 17, Paraiso Rd, 1400",
        coordinates: [121.04040046802031, 14.7721611560019],
        boundary: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: [
                    [121.0400, 14.7725],
                    [121.0410, 14.7725],
                    [121.0410, 14.7718],
                    [121.0400, 14.7718],
                    [121.0400, 14.7725]
                ]
            }
        },
        focalPerson: {
            name: "Gwyneth Uy",
            photo: "/images/focal-persons/gwyneth.jpg",
            contactNumber: "+63 912 345 6792",
            email: "gwyneth.uy@gmail.com",
            houseAddress: "Block 1, Lot 17, Paraiso Rd, 1400",
            coordinates: "14.772161, 121.040400"
        },
        alternativeFocalPerson: {
            altName: "Rodel Sustiguer",
            altContactNumber: "+63 912 345 6793",
            altEmail: "rodel.sustiguer@gmail.com"
        }
    }
};