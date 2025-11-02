import { useEffect, useState } from 'react';
import { apiFetch } from '../../../Official/Reports/api/api';
import { useFocalAuth } from '../../context/focalAuthContext';
import type { CommunityData } from '../types/community';

export default function useCommunityData() {
    const { token } = useFocalAuth();
    const [data, setData] = useState<CommunityData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCommunity = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await apiFetch<{
                neighborhoodID?: string;
                address?: string | { address?: string; lat?: number; lng?: number };
                households?: number | string;
                residents?: number | string;
                noOfHouseholds?: number | string;
                noOfResidents?: number | string;
                floodwaterRange?: string;
                floodwaterSubsidenceDuration?: number | string;
                boundaryGeoJSON?: string;
                terminalID?: string;
                createdDate?: string;
                updatedDate?: string;
                hazards?: string[];
                otherInformation?: string;
                focalPerson?: {
                    name?: string;
                    contact?: string;
                    number?: string;
                    email?: string;
                    image?: string;
                    photo?: string;
                    alternativeFPFirstName?: string;
                    alternativeFPLastName?: string;
                    alternativeFPNumber?: string;
                    alternativeFPEmail?: string;
                    alternativeFPImage?: string;
                };
            }>('/neighborhood/own', { headers });
            // Map backend response to CommunityData shape
            let addressString = '';
            let coordsString = '';
            if (typeof res.address === 'string') {
                try {
                    const addrObj = JSON.parse(res.address);
                    if (addrObj) {
                        if (typeof addrObj.address === 'string') addressString = addrObj.address;
                        if (typeof addrObj.lat === 'number' && typeof addrObj.lng === 'number') coordsString = `${addrObj.lat}, ${addrObj.lng}`;
                    }
                } catch {
                    addressString = res.address;
                }
            } else if (res.address && typeof res.address === 'object') {
                if (typeof res.address.address === 'string') addressString = res.address.address;
                if (typeof res.address.lat === 'number' && typeof res.address.lng === 'number') coordsString = `${res.address.lat}, ${res.address.lng}`;
            } else {
                addressString = res.address || '';
            }

            const mapped: CommunityData = {
                groupName: res.neighborhoodID || '',
                terminalId: res.terminalID || '',
                registeredAt: res.createdDate ? new Date(res.createdDate).toLocaleDateString() : '',
                updatedAt: res.updatedDate ? new Date(res.updatedDate).toLocaleDateString() : '',
                stats: {
                    noOfResidents: res.noOfResidents ?? '',
                    noOfHouseholds: res.noOfHouseholds ?? '',
                },
                hazards: Array.isArray(res.hazards) ? res.hazards : [],
                otherInfo: res.otherInformation ? [res.otherInformation] : [],
                floodwaterSubsidenceDuration: res.floodwaterSubsidenceDuration ? String(res.floodwaterSubsidenceDuration) : '', address: addressString,
                coordinates: coordsString,
                focal: {
                    name: res.focalPerson?.name || '',
                    contact: res.focalPerson?.number || '',
                    email: res.focalPerson?.email || '',
                    photo: res.focalPerson?.photo || null,
                },
                altFocal: {
                    name: [res.focalPerson?.alternativeFPFirstName, res.focalPerson?.alternativeFPLastName].filter(Boolean).join(' '),
                    contact: res.focalPerson?.alternativeFPNumber || '',
                    email: res.focalPerson?.alternativeFPEmail || '',
                    photo: res.focalPerson?.alternativeFPImage || null,
                },
            };
            setData(mapped);
        } catch {
            setError('Failed to load community data');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return { data, loading, error, refetch: fetchCommunity } as const;
}
