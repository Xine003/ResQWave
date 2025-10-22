export type CommunityData = {
    groupName: string;
    terminalId: string;
    registeredAt: string;
    updatedAt: string;
    stats: {
        noOfResidents: number | string;
        noOfHouseholds: number | string;
    };
    hazards: string[];
    otherInfo: string[];
    floodwaterSubsidenceDuration?: string;
    address: string;
    coordinates: string;
    focal: {
        name: string;
        contact: string;
        email?: string;
        photo?: string | null;
    };
    altFocal: {
        name: string;
        contact: string;
        email?: string;
        photo?: string | null;
    };
};
