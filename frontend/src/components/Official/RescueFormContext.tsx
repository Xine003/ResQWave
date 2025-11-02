/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

interface RescueFormContextType {
  isRescueFormOpen: boolean;
  setIsRescueFormOpen: (open: boolean) => void;
  isRescuePreviewOpen: boolean;
  setIsRescuePreviewOpen: (open: boolean) => void;
  toggleRescueForm: () => void;
}

const RescueFormContext = createContext<RescueFormContextType | undefined>(undefined);

export const RescueFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRescueFormOpen, setIsRescueFormOpen] = useState(false);
  const [isRescuePreviewOpen, setIsRescuePreviewOpen] = useState(false);

  const toggleRescueForm = () => {
    setIsRescueFormOpen(prev => !prev);
  };

  return (
    <RescueFormContext.Provider value={{
      isRescueFormOpen,
      setIsRescueFormOpen,
      isRescuePreviewOpen,
      setIsRescuePreviewOpen,
      toggleRescueForm
    }}>
      {children}
    </RescueFormContext.Provider>
  );
};

// Mark this as a hook by using 'use' prefix and ensure it's not treated as a component
export const useRescueForm = (): RescueFormContextType => {
  const context = useContext(RescueFormContext);
  if (context === undefined) {
    throw new Error('useRescueForm must be used within a RescueFormProvider');
  }
  return context;
};
