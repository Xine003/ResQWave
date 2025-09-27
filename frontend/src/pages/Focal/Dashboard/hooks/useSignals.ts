import { useState } from 'react';
import type { Signal, SignalPopover, InfoBubble } from '../types/signalsdata';

const initialOtherSignals: Signal[] = [
    {
        coordinates: [121.03197820799186, 14.772888009898285],
        properties: {
            status: 'offline',
            deviceId: 'RSQW-101',
            focalPerson: 'Marites Dela Cruz',
            altFocalPerson: 'Rodel Sustiguer',
            address: 'Block 2, Lot 5, Rizal St.',
            date: 'September 3, 2025',
            name: 'PAMAKAI'
        },
        boundary: [
            [121.0315, 14.7732],
            [121.0325, 14.7732],
            [121.0325, 14.7725],
            [121.0315, 14.7725],
            [121.0315, 14.7732]
        ]
    },
    {
        coordinates: [121.04440528679821, 14.776897515717772],
        properties: {
            status: 'offline',
            deviceId: 'RSQW-102',
            focalPerson: 'Gwen Uy',
            altFocalPerson: 'Jose Ramos',
            address: 'Lot 11, Paraiso Rd.',
            date: 'September 7, 2025',
            name: 'PENTUNAI HOA'
        },
        boundary: [
            [121.0440, 14.7772],
            [121.0450, 14.7772],
            [121.0450, 14.7765],
            [121.0440, 14.7765],
            [121.0440, 14.7772]
        ]
    },
    {
        coordinates: [121.039008311252, 14.768014818600191],
        properties: {
            status: 'offline',
            deviceId: 'RSQW-103',
            focalPerson: 'Ana Santos',
            altFocalPerson: 'Lito Perez',
            address: 'Corner Gen. Luna & Mabini',
            date: 'August 28, 2025',
            name: 'ANCOP VILLAGE'
        },
        boundary: [
            [121.0385, 14.7684],
            [121.0395, 14.7684],
            [121.0395, 14.7677],
            [121.0385, 14.7677],
            [121.0385, 14.7684]
        ]
    }
];

const initialOwnCommunitySignal: Signal = {
    coordinates: [121.04040046802031, 14.7721611560019],
    properties: {
        status: 'online',
        deviceId: 'RSQW-001',
        focalPerson: 'Gwyneth Uy',
        altFocalPerson: 'Rodel Sustiguer',
        address: 'Block 1, Lot 17, Paraiso Rd, 1400',
        date: 'September 9, 2025',
        name: 'Lerandia Subdivision'
    },
    boundary: [
        [121.0400, 14.7725],
        [121.0410, 14.7725],
        [121.0410, 14.7718],
        [121.0400, 14.7718],
        [121.0400, 14.7725]
    ]
};

export default function useSignals() {
    const [otherSignals, setOtherSignals] = useState<Signal[]>(initialOtherSignals);
    const [ownCommunitySignal, setOwnCommunitySignal] = useState<Signal>(initialOwnCommunitySignal);

    const [editBoundaryOpen, setEditBoundaryOpen] = useState(false);
    const [savedGeoJson, setSavedGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
    const [popover, setPopover] = useState<SignalPopover | null>(null);
    const [infoBubble, setInfoBubble] = useState<InfoBubble | null>(null);
    const [infoBubbleVisible, setInfoBubbleVisible] = useState(true);
    const [canSave, setCanSave] = useState(false);

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
