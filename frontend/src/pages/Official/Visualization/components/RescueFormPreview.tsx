import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRescueWaitlist } from "../contexts/RescueWaitlistContext";

interface RescueFormData {
    focalPerson: string;
    focalUnreachable: boolean;
    waterLevel: string;
    waterLevelDetails: string;
    urgencyLevel: string;
    urgencyDetails: string;
    hazards: string[];
    hazardDetails: string;
    accessibility: string;
    accessibilityDetails: string;
    resources: string[];
    resourceDetails: string;
    otherInfo: string;
    // Optional fields for waitlisted items
    id?: string;
    timestamp?: string;
    status?: string;
}

interface RescueFormPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    formData: RescueFormData;
    onWaitlist?: (formData: RescueFormData) => void;
    onDispatch?: (formData: RescueFormData) => void;
}

export default function RescueFormPreview({ isOpen, onClose, onBack, formData, onWaitlist, onDispatch }: RescueFormPreviewProps) {
    const { removeFromWaitlist } = useRescueWaitlist();

    const handleWaitlist = () => {
        if (onWaitlist) {
            onWaitlist(formData);
        }
        onClose();
    };

    const handleDispatchRescue = () => {
        // Remove from waitlist if it has an id (meaning it was waitlisted)
        if ('id' in formData && typeof formData.id === 'string') {
            removeFromWaitlist(formData.id);
        }
        
        // Close the preview immediately
        onClose();
        
        // Call the dispatch callback to show the dialog in the parent component
        if (onDispatch) {
            onDispatch(formData);
        }
    };

    const renderSelectedOptions = (options: string[] | string) => {
        if (Array.isArray(options)) {
            return options.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                    {options.map((option, index) => (
                        <span
                            key={index}
                            className="bg-white text-black px-3 py-1 rounded text-sm"
                        >
                            {option}
                        </span>
                    ))}
                </div>
            ) : null;
        } else {
            return options ? (
                <div className="mt-2">
                    <span className="bg-white text-black px-3 py-1 rounded text-sm">
                        {options}
                    </span>
                </div>
            ) : null;
        }
    };

    const renderDetailText = (details: string) => {
        return details ? (
            <div className="mt-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded p-3">
                <p className="text-white text-sm">{details}</p>
            </div>
        ) : null;
    };

    return (
        <div 
            className={`fixed top-0 right-0 h-full w-[540px] bg-[#171717] border-l border-[#2a2a2a] transform transition-transform duration-300 ease-in-out z-[60] ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            {/* Header */}
            <div className="p-6 border-b border-[#2a2a2a]">
                <div className="flex justify-between items-center">
                    <h1 className="text-white text-xl font-medium">
                        Confirm Rescue Form
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white h-8 w-8"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-24 h-[calc(100vh-160px)]">
                {/* Focal Person */}
                <div className="mb-6 pt-6">
                    <input
                        type="text"
                        value={`Focal Person: ${formData.focalPerson}`}
                        disabled
                        title="Focal Person Name"
                        className="w-full bg-white text-black px-4 py-3 rounded-md text-sm font-medium"
                    />
                </div>

                {/* Focal Unreachable */}
                {formData.focalUnreachable && (
                    <div className="mb-6">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-4 h-4 bg-white rounded border"></div>
                            <span className="text-sm">Focal Unreachable</span>
                        </div>
                    </div>
                )}

                {/* 1. Water Level */}
                <div className="mb-6">
                    <h3 className="text-white font-medium text-sm mb-2">1. Water Level</h3>
                    <p className="text-gray-400 text-sm mb-2">
                        How high is the floodwater now compared to rescue family, seats, chest, above head?
                    </p>
                    {renderSelectedOptions(formData.waterLevel)}
                    {renderDetailText(formData.waterLevelDetails)}
                </div>

                {/* 2. Urgency of Evacuation */}
                <div className="mb-6">
                    <h3 className="text-white font-medium text-sm mb-2">2. Urgency of Evacuation</h3>
                    <p className="text-gray-400 text-sm mb-2">
                        Are residents still safe inside, or is evacuation needed immediately?
                    </p>
                    {renderSelectedOptions(formData.urgencyLevel)}
                    {renderDetailText(formData.urgencyDetails)}
                </div>

                {/* 3. Hazards Present */}
                <div className="mb-6">
                    <h3 className="text-white font-medium text-sm mb-2">3. Hazards Present</h3>
                    <p className="text-gray-400 text-sm mb-2">
                        Do you see any hazards like wires, currents, or debris?
                    </p>
                    {renderSelectedOptions(formData.hazards)}
                    {renderDetailText(formData.hazardDetails)}
                </div>

                {/* 4. Accessibility */}
                <div className="mb-6">
                    <h3 className="text-white font-medium text-sm mb-2">4. Accessibility</h3>
                    <p className="text-gray-400 text-sm mb-2">
                        Is the area accessible for rescue vehicles or only boats?
                    </p>
                    {renderSelectedOptions(formData.accessibility)}
                    {renderDetailText(formData.accessibilityDetails)}
                </div>

                {/* 5. Resources Needs */}
                <div className="mb-6">
                    <h3 className="text-white font-medium text-sm mb-2">5. Resources Needs</h3>
                    <p className="text-gray-400 text-sm mb-2">
                        Is the area accessible for rescue vehicles or only boats?
                    </p>
                    {renderSelectedOptions(formData.resources)}
                    {renderDetailText(formData.resourceDetails)}
                </div>

                {/* 6. Other Information */}
                {formData.otherInfo && (
                    <div className="mb-8">
                        <h3 className="text-white font-medium text-sm mb-2">6. Other Information</h3>
                        {renderDetailText(formData.otherInfo)}
                    </div>
                )}
            </div>

            {/* Sticky Footer Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#171717] border-t border-[#2a2a2a]">
                <div className="flex gap-4">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white h-12"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleWaitlist}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white h-12"
                    >
                        Waitlist
                    </Button>
                    <Button
                        onClick={handleDispatchRescue}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                        Dispatch Rescue
                    </Button>
                </div>
            </div>
        </div>
    );
}