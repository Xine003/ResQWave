import { apiFetch } from '@/lib/api';

// Backend response type from the map alert endpoints
export interface MapAlertResponse {
    alertId: string;
    alertType: 'Critical' | 'User-Initiated';
    timeSent: string;
    alertStatus: string;
    terminalId: string;
    terminalName: string;
    terminalStatus: 'Online' | 'Offline';
    focalPersonId: string;
    focalFirstName: string;
    focalLastName: string;
    focalAddress: string; // JSON format: {"address":"...","coordinates":"lng, lat"}
    focalContactNumber: string;
}

// Parsed signal data for map display
export interface MapSignal {
    alertId: string;
    deviceId: string;
    deviceName: string;
    alertType: string;
    terminalStatus: 'Online' | 'Offline';
    timeSent: string;
    focalPerson: string;
    address: string; // Readable address
    contactNumber: string;
    coordinates: [number, number] | null; // [lng, lat]
}

/**
 * Parse coordinates from JSON address format
 * Format: {"address":"...","coordinates":"lng, lat"}
 */
export function parseCoordinates(addressJson: string): [number, number] | null {
    if (!addressJson) return null;
    
    try {
        const parsed = JSON.parse(addressJson);
        if (parsed && parsed.coordinates) {
            const coords = parsed.coordinates.split(',').map((s: string) => parseFloat(s.trim()));
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                return [coords[0], coords[1]];
            }
        }
    } catch (e) {
        const match = addressJson.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        if (match) {
            const first = parseFloat(match[1]);
            const second = parseFloat(match[2]);
            if (!isNaN(first) && !isNaN(second)) {
                return [first, second];
            }
        }
    }
    
    return null;
}

/**
 * Extract readable address from JSON format
 */
export function extractAddress(addressJson: string): string {
    if (!addressJson) return 'N/A';
    
    try {
        const parsed = JSON.parse(addressJson);
        if (parsed && parsed.address) {
            return parsed.address;
        }
    } catch (e) {
        // Return raw string if not JSON
        return addressJson;
    }
    
    return addressJson;
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: string): string {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return timestamp;
    }
}

/**
 * Transform backend response to MapSignal format
 */
export function transformToMapSignal(alert: MapAlertResponse): MapSignal | null {
    const coordinates = parseCoordinates(alert.focalAddress);
    
    if (!coordinates) return null;
    
    return {
        alertId: alert.alertId,
        deviceId: alert.terminalId,
        deviceName: alert.terminalName || 'N/A',
        alertType: alert.alertType,
        terminalStatus: alert.terminalStatus,
        timeSent: formatTime(alert.timeSent),
        focalPerson: `${alert.focalFirstName} ${alert.focalLastName}`.trim(),
        address: extractAddress(alert.focalAddress),
        contactNumber: alert.focalContactNumber || 'N/A',
        coordinates
    };
}

/**
 * Fetch unassigned map alerts
 */
export async function fetchUnassignedMapAlerts(): Promise<MapSignal[]> {
    try {
        const response = await apiFetch<MapAlertResponse[]>('/alerts/map/unassigned');
        
        return response
            .map(transformToMapSignal)
            .filter((signal): signal is MapSignal => signal !== null);
    } catch (error) {
        console.error('[MAP] Error fetching unassigned alerts:', error);
        throw error;
    }
}

/**
 * Fetch waitlisted map alerts
 */
export async function fetchWaitlistedMapAlerts(): Promise<MapSignal[]> {
    try {
        const response = await apiFetch<MapAlertResponse[]>('/alerts/map/waitlisted');
        
        return response
            .map(transformToMapSignal)
            .filter((signal): signal is MapSignal => signal !== null);
    } catch (error) {
        console.error('[MAP] Error fetching waitlisted alerts:', error);
        throw error;
    }
}

/**
 * Fetch all map alerts (both unassigned and waitlisted)
 */
export async function fetchAllMapAlerts(): Promise<MapSignal[]> {
    try {
        const [unassigned, waitlisted] = await Promise.all([
            fetchUnassignedMapAlerts(),
            fetchWaitlistedMapAlerts()
        ]);
        
        return [...unassigned, ...waitlisted];
    } catch (error) {
        console.error('[MAP] Error fetching all alerts:', error);
        throw error;
    }
}
