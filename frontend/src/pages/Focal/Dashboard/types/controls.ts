import type React from 'react';

export type MapControlsProps = {
    mapRef: React.RefObject<any>;
    mapLoaded: boolean;
    makeTooltip: (text: string) => React.ReactNode;
    addCustomLayers: (map: any) => void;
    editBoundaryOpen: boolean;
    handleDeleteBoundary: () => void;
};
