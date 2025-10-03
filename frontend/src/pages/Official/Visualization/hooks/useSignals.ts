import { useState } from 'react';
import { predefinedCommunityGroupDetails } from '../../CommunityGroups/data/predefinedCommunityGroups';
import type { InfoBubble, Signal, SignalPopover } from '../types/signals';

const initialOtherSignals: Signal[] = [
    {
        coordinates: [121.03197820799186, 14.772888009898285],
        properties: {
            status: 'OFFLINE',
            deviceId: 'RSQW-101',
            focalPerson: 'Marites Dela Cruz',
            altFocalPerson: 'Rodel Sustiguer',
            address: 'Block 2, Lot 5, Rizal St.',
            date: 'September 3, 2025',
            name: 'PAMAKAI',
            alertType: 'OFFLINE'
        },
        boundary: [
            [121.0315, 14.7732],
            [121.0325, 14.7732],
            [121.0325, 14.7725],
            [121.0315, 14.7725],
            [121.0315, 14.7732]
        ],
        communityDetails: predefinedCommunityGroupDetails['RSQW-101']
    },
    {
        coordinates: [121.04440528679821, 14.776897515717772],
        properties: {
            status: 'ONLINE',
            deviceId: 'RSQW-102',
            focalPerson: 'Gwen Uy',
            altFocalPerson: 'Jose Ramos',
            address: 'Lot 11, Paraiso Rd.',
            date: 'September 7, 2025',
            name: 'PENTUNAI HOA',
            alertType: 'USER-INITIATED'
        },
        boundary: [
            [121.0440, 14.7772],
            [121.0450, 14.7772],
            [121.0450, 14.7765],
            [121.0440, 14.7765],
            [121.0440, 14.7772]
        ],
        communityDetails: predefinedCommunityGroupDetails['RSQW-102']
    },
    {
        coordinates: [121.039008311252, 14.768014818600191],
        properties: {
            status: 'ONLINE',
            deviceId: 'RSQW-103',
            focalPerson: 'Ana Santos',
            altFocalPerson: 'Lito Perez',
            address: 'Corner Gen. Luna & Mabini',
            date: 'September 12, 2025',
            name: 'BAYBAYIN',
            alertType: 'CRITICAL'
        },
        boundary: [
            [121.0385, 14.7684],
            [121.0395, 14.7684],
            [121.0395, 14.7677],
            [121.0385, 14.7677],
            [121.0385, 14.7684]
        ],
        communityDetails: predefinedCommunityGroupDetails['RSQW-103']
    }
];

const initialOwnCommunitySignal: Signal = {
    coordinates: [121.04040046802031, 14.7721611560019],
    properties: {
        status: 'ONLINE',
        deviceId: 'RSQW-001',
        focalPerson: 'Gwyneth Uy',
        altFocalPerson: 'Rodel Sustiguer',
        address: 'Block 1, Lot 17, Paraiso Rd, 1400',
        date: 'September 9, 2025',
        name: 'Lerandia Subdivision',
        alertType: 'ONLINE'
    },
    boundary: [
        [121.0400, 14.7725],
        [121.0410, 14.7725],
        [121.0410, 14.7718],
        [121.0400, 14.7718],
        [121.0400, 14.7725]
    ],
    communityDetails: predefinedCommunityGroupDetails['RSQW-001']
};

export default function useSignals() {
    const [otherSignals] = useState<Signal[]>(initialOtherSignals);
    const [ownCommunitySignal] = useState<Signal>(initialOwnCommunitySignal);

    const [popover, setPopover] = useState<SignalPopover | null>(null);
    const [infoBubble, setInfoBubble] = useState<InfoBubble | null>(null);
    const [infoBubbleVisible, setInfoBubbleVisible] = useState(true);

    const getDistressCoord = () => ownCommunitySignal.coordinates as [number, number];

    return {
        otherSignals,
        ownCommunitySignal,
        popover,
        setPopover,
        infoBubble,
        setInfoBubble,
        infoBubbleVisible,
        setInfoBubbleVisible,
        getDistressCoord
    } as const;
}