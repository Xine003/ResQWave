import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRescueWaitlist, type WaitlistedRescueForm } from "../contexts/RescueWaitlistContext";
import type { Signal } from "../types/signals";

interface LiveReportSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    signals: Signal[];
    onCardClick?: (signal: Signal) => void;
    onWaitlistCardClick?: (form: WaitlistedRescueForm) => void;
}

export default function LiveReportSidebar({ isOpen, onClose, signals, onCardClick, onWaitlistCardClick }: LiveReportSidebarProps) {
    const [activeTab, setActiveTab] = useState<'unassigned' | 'waitlisted'>('unassigned');
    const { waitlistedForms, setSelectedWaitlistForm } = useRescueWaitlist();

    // Switch to waitlisted tab when a new rescue form is added to waitlist
    useEffect(() => {
        if (waitlistedForms.length > 0 && isOpen) {
            setActiveTab('waitlisted');
        }
    }, [waitlistedForms.length, isOpen]);

    // Filter signals - properly separate between unassigned and waitlisted
    // Unassigned: CRITICAL and USER-INITIATED alerts that are currently ONLINE (active/unassigned)
    const unassignedAlerts = signals.filter(signal => 
        (signal.properties.alertType === 'CRITICAL' || signal.properties.alertType === 'USER-INITIATED') &&
        signal.properties.status === 'ONLINE'
    );
    
    // Waitlisted: CRITICAL and USER-INITIATED alerts that are OFFLINE (waiting/assigned)
    const waitlistedAlerts = signals.filter(signal => 
        (signal.properties.alertType === 'CRITICAL' || signal.properties.alertType === 'USER-INITIATED') &&
        signal.properties.status === 'OFFLINE'
    );

    const formatTime = (dateString?: string) => {
        if (!dateString) return '12:00:00 PM';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        });
    };

    const renderAlertCard = (signal: Signal, index: number) => (
        <div 
            key={signal.properties.deviceId} 
            className="border border-[#2a2a2a] rounded-[5px] p-4 mb-3 relative hover:bg-[#262626] transition-colors duration-200 cursor-pointer"
            onClick={() => onCardClick?.(signal)}
        >
            <div className="pr-10">
                <h3 className="text-white font-medium text-sm mb-3">
                    {signal.properties.name || 'Unknown Location'}
                </h3>
                
                {signal.properties.alertType && (
                    <div className="mb-3">
                        <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 rounded-[3px] ${
                                signal.properties.alertType === 'CRITICAL' 
                                    ? 'border-red-500 text-red-500 bg-red-500/10' 
                                    : 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                            }`}
                        >
                            {signal.properties.alertType}
                        </Badge>
                    </div>
                )}
                
                <div className="space-y-1 text-xs text-gray-400">
                    <p>Time Sent: {formatTime(signal.properties.date)}</p>
                    <p>{signal.properties.address || 'No address provided'}</p>
                </div>
            </div>
            
            {/* Info button positioned on the right side, vertically centered */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-6 w-6">
                    <Info className="h-4.5 w-4.5" />
                </Button>
            </div>
        </div>
    );

    const renderWaitlistCard = (form: WaitlistedRescueForm, index: number) => (
        <div 
            key={`waitlist-${form.id}-${index}`} 
            className="border border-[#2a2a2a] rounded-[5px] p-4 mb-3 relative hover:bg-[#262626] transition-colors duration-200 cursor-pointer"
            onClick={() => {
                setSelectedWaitlistForm(form);
                onWaitlistCardClick?.(form);
            }}
        >
            <div className="pr-10">
                <h3 className="text-white font-medium text-sm mb-3">
                    {form.address || 'Rescue Request'}
                </h3>
                
                <div className="mb-3">
                    <Badge 
                        variant="outline" 
                        className="border-yellow-500 text-yellow-500 bg-yellow-500/10 text-xs px-2 py-1 rounded-[3px]"
                    >
                        RESCUE WAITLIST
                    </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-gray-400">
                    <p>Focal Person: {form.focalPerson}</p>
                    <p>Water Level: {form.waterLevel}</p>
                    <p>Urgency: {form.urgencyLevel}</p>
                </div>
            </div>
            
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-6 w-6">
                    <Info className="h-4.5 w-4.5" />
                </Button>
            </div>
        </div>
    );

    const renderAlerts = (alerts: Signal[]) => {
        // Remove duplicates based on deviceId
        const uniqueAlerts = alerts.reduce((acc, current) => {
            const exists = acc.find(item => item.properties.deviceId === current.properties.deviceId);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, [] as Signal[]);

        const totalItems = activeTab === 'waitlisted' 
            ? uniqueAlerts.length + (waitlistedForms?.length || 0)
            : uniqueAlerts.length;

        if (totalItems === 0) {
            return (
                <div className="text-center text-gray-400 mt-8">
                    No {activeTab} alerts
                </div>
            );
        }

        const alertCards = uniqueAlerts.map((signal, index) => renderAlertCard(signal, index));
        
        if (activeTab === 'waitlisted' && waitlistedForms) {
            const waitlistCards = waitlistedForms.map((form: WaitlistedRescueForm, index: number) => renderWaitlistCard(form, index));
            return [...alertCards, ...waitlistCards];
        }

        return alertCards;
    };

    return (
        <div 
            className={`fixed top-0 right-0 h-full w-[400px] bg-[#171717] border-l border-[#2a2a2a] transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ zIndex: 50 }}
        >
            {/* Header */}
            <div className="p-5.5 border-b border-[#2a2a2a]">
                <div className="flex justify-between items-center">
                    <h1 className="text-white text-lg font-normal">
                        Live Report
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white h-6 w-6"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="p-4 pb-4">
                <div className="flex gap-2 p-1 rounded-[5px] bg-[#262626]">
                    <button
                        onClick={() => setActiveTab('unassigned')}
                        className={`flex-1 rounded-[5px] h-8 px-4 transition-colors duration-200 flex items-center justify-center ${
                            activeTab === 'unassigned'
                                ? 'bg-[#414141] text-white'
                                : 'bg-transparent text-gray-300 hover:text-white hover:bg-[#333333]'
                        }`}
                    >
                        Unassigned
                        <span className="ml-2 bg-[#606060] text-white text-xs px-2 py-1 rounded-full">
                            {unassignedAlerts.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('waitlisted')}
                        className={`flex-1 rounded-[5px] h-8 px-4 transition-colors duration-200 flex items-center justify-center ${
                            activeTab === 'waitlisted'
                                ? 'bg-[#414141] text-white'
                                : 'bg-transparent text-gray-300 hover:text-white hover:bg-[#333333]'
                        }`}
                    >
                        Waitlisted
                        <span className="ml-2 bg-[#606060] text-white text-xs px-2 py-1 rounded-full">
                            {waitlistedAlerts.length + (waitlistedForms?.length || 0)}
                        </span>
                    </button>
                </div>
            </div>

            {/* Info Section - Only visible in Unassigned tab */}
            <div className="px-4 pb-4">
                {activeTab === 'unassigned' && (
                    <div className="border border-[#2a2a2a] rounded-[5px] p-4 flex items-start gap-3">
                        <div className="bg-blue-500/15 rounded-[5px] p-3 mt-0.5">
                            <Info className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Emergencies that have not been addressed and no rescue team has been dispatched.
                        </p>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 h-[calc(100vh-200px)]">
                {activeTab === 'unassigned' && renderAlerts(unassignedAlerts)}
                {activeTab === 'waitlisted' && renderAlerts(waitlistedAlerts)}
            </div>
        </div>
    );
}