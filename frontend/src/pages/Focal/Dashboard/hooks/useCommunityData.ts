import { useEffect, useState } from 'react';
import type { CommunityData } from '../types/community';

// module-level mock store so multiple components using the hook share the same data
let store: CommunityData = {
    groupName: 'Sicat Residence',
    terminalId: 'RSQW-001',
    communityId: 'CG-009',
    registeredAt: 'September 10, 2025',
    updatedAt: 'September 11, 2025',
    stats: {
        individuals: 50,
        families: 10,
        kids: 5,
        seniors: 8,
        pwds: 5,
        pregnant: 10,
    },
    note: 'Prone to landslide and tree falling',
    focal: {
        name: 'Gwyneth Uy',
        contact: '0905 385 4293',
        email: 'uy.gwynethfabul@gmail.com',
        address: 'Block 1, Lot 17, Paraiso Rd, 1400',
        coordinates: '14.774083, 121.042443',
        altFocal: 'Rodel Sustiguer',
        altContact: '0905 563 2034',
        photo: 'https://avatars.githubusercontent.com/u/1?v=4',
        altPhoto: null,
    }
};

const listeners = new Set<() => void>();

export function getCommunityData() {
    return store;
}

export function setCommunityData(next: CommunityData) {
    store = next;
    listeners.forEach((l) => l());
}

export function subscribe(fn: () => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
}

export default function useCommunityData() {
    const [data, setData] = useState<CommunityData>(getCommunityData());

    useEffect(() => {
        return subscribe(() => setData(getCommunityData()));
    }, []);

    return { data, setData: setCommunityData } as const;
}
