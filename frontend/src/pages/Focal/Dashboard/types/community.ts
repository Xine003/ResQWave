export type CommunityData = {
    groupName: string;
    terminalId: string;
    communityId: string;
    registeredAt: string;
    updatedAt: string;
    stats: {
        individuals: number;
        families: number;
        kids: number;
        seniors: number;
        pwds: number;
        pregnant: number;
    };
    note: string;
    focal: {
        name: string;
        contact: string;
        email?: string;
        address: string;
        coordinates: string;
        altFocal?: string;
        altContact?: string;
        photo?: string | null;
        altPhoto?: string | null;
    };
};
