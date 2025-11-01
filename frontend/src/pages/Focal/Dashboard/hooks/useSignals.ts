import { useEffect, useState } from 'react';
import { apiFetch } from '../../../Official/Reports/api/api';
import { useFocalAuth } from '../../context/focalAuthContext';
import type { InfoBubble, Signal, SignalPopover } from '../types/signals';
// Fallback initial values (empty)
const initialOtherSignals: Signal[] = [];
const initialOwnCommunitySignal: Signal = {
    coordinates: [0, 0],
    properties: {
        status: '',
        deviceId: '',
        focalPerson: '',
        altFocalPerson: '',
        address: '',
        date: '',
        name: ''
    },
};


// Fallback initial values (empty)
export function useSignals() {
const initialOwnCommunitySignal: Signal = {
    coordinates: [0, 0],
    properties: {
        status: '',
        deviceId: '',
        focalPerson: '',
        altFocalPerson: '',
        address: '',
        date: '',
        name: ''
    },
};


    const { token } = useFocalAuth();
    const [otherSignals, setOtherSignals] = useState<Signal[]>(initialOtherSignals);
    const [ownCommunitySignal, setOwnCommunitySignal] = useState<Signal>(initialOwnCommunitySignal);

    const [editBoundaryOpen, setEditBoundaryOpen] = useState(false);
    const [savedGeoJson, setSavedGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
    const [popover, setPopover] = useState<SignalPopover | null>(null);
    const [infoBubble, setInfoBubble] = useState<InfoBubble | null>(null);
    const [infoBubbleVisible, setInfoBubbleVisible] = useState(true);
    const [canSave, setCanSave] = useState(false);


    // Fetch signals from backend on mount
    useEffect(() => {
        async function fetchSignals() {
            try {
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                // Fetch own neighborhood (with focal, terminal info)
                const own = await apiFetch<any>(`/neighborhood/map/own`, { headers });
                // Fetch other neighborhoods (limited info)
                const others = await apiFetch<any[]>(`/neighborhood/map/others`, { headers });


                // Parse coordinates from address JSON string
                let ownCoords: [number, number] = [0, 0];
                let ownAddress = '';
                if (own.address) {
                    try {
                        const addrObj = typeof own.address === 'string' ? JSON.parse(own.address) : own.address;
                        if (addrObj && typeof addrObj.lat === 'number' && typeof addrObj.lng === 'number') {
                            ownCoords = [addrObj.lng, addrObj.lat];
                            ownAddress = addrObj.address || '';
                        }
                    } catch (e) {
                        ownAddress = own.address;
                    }
                }
                setOwnCommunitySignal({
                    coordinates: ownCoords,
                    properties: {
                        status: 'online',
                        deviceId: own.terminalID || '',
                        focalPerson: own.focalPerson?.name || '',
                        altFocalPerson: (
                            own.focalPerson?.alternativeFPFirstName || own.focalPerson?.alternativeFPLastName
                        )
                            ? [own.focalPerson?.alternativeFPFirstName, own.focalPerson?.alternativeFPLastName].filter(Boolean).join(' ')
                            : '',
                        address: ownAddress,
                        date: own.createdDate ? new Date(own.createdDate).toLocaleDateString() : '',
                        name: '',
                    }
                });

                setOtherSignals(
                    (others || []).map((nb: any) => {
                        // Parse coordinates from address JSON string
                        let coords: [number, number] = [0, 0];
                        let address = '';
                        if (nb.address) {
                            try {
                                const addrObj = typeof nb.address === 'string' ? JSON.parse(nb.address) : nb.address;
                                if (addrObj && typeof addrObj.lat === 'number' && typeof addrObj.lng === 'number') {
                                    coords = [addrObj.lng, addrObj.lat];
                                    address = addrObj.address || '';
                                }
                            } catch (e) {
                                address = nb.address;
                            }
                        }
                        return {
                            coordinates: coords,
                            properties: {
                                status: 'offline',
                                deviceId: nb.terminalID || '',
                                focalPerson: '',
                                altFocalPerson: '',
                                address,
                                date: nb.createdDate ? new Date(nb.createdDate).toLocaleDateString() : '',
                                name: '',
                            }
                        };
                    })
                );
            } catch (e) {
                setOtherSignals(initialOtherSignals);
                setOwnCommunitySignal(initialOwnCommunitySignal);
            }
        }
        fetchSignals();
    }, [token]);

    const updateBoundary = (deviceId: string | undefined, newBoundary: [number, number][] | null) => {
        if (!deviceId || !newBoundary) return;
        if (deviceId === ownCommunitySignal.properties.deviceId) {
            setOwnCommunitySignal(prev => ({ ...prev, boundary: newBoundary }));
            return;
        }
        setOtherSignals(prev => prev.map(s => s.properties.deviceId === deviceId ? { ...s, boundary: newBoundary } : s));
    };

    const getDistressCoord = () => ownCommunitySignal.coordinates as [number, number];

    return {
        otherSignals,
        ownCommunitySignal,
        editBoundaryOpen,
        setEditBoundaryOpen,
        savedGeoJson,
        setSavedGeoJson,
        popover,
        setPopover,
        infoBubble,
        setInfoBubble,
        infoBubbleVisible,
        setInfoBubbleVisible,
        canSave,
        setCanSave,
        updateBoundary,
        getDistressCoord
    } as const;
}

export default useSignals;
