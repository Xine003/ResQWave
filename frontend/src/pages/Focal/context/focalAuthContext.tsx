import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface FocalAuthContextType {
  token: string | null;
  focalId: string | null;
  setToken: (token: string | null) => void;
  setFocalId: (id: string | null) => void;
  logout: () => void;
}

const FocalAuthContext = createContext<FocalAuthContextType | undefined>(undefined);

export function FocalAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('focalToken');
  });
  const [focalId, setFocalIdState] = useState<string | null>(() => {
    return localStorage.getItem('focalId');
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('focalToken', token);
    } else {
      localStorage.removeItem('focalToken');
    }
  }, [token]);

  useEffect(() => {
    if (focalId) {
      localStorage.setItem('focalId', focalId);
    } else {
      localStorage.removeItem('focalId');
    }
  }, [focalId]);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    // Also update focalId if possible
    if (newToken) {
      try {
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        if (payload.id) {
          setFocalIdState(payload.id);
        }
      } catch {}
    } else {
      setFocalIdState(null);
    }
  };

  const setFocalId = (id: string | null) => {
    setFocalIdState(id);
  };

  const logout = () => {
    setTokenState(null);
    setFocalIdState(null);
    localStorage.removeItem('focalToken');
    localStorage.removeItem('focalId');
    sessionStorage.removeItem('focalTempToken');
  };

  return (
    <FocalAuthContext.Provider value={{ token, focalId, setToken, setFocalId, logout }}>
      {children}
    </FocalAuthContext.Provider>
  );
}

export function useFocalAuth() {
  const context = useContext(FocalAuthContext);
  if (!context) {
    throw new Error('useFocalAuth must be used within a FocalAuthProvider');
  }
  return context;
}
