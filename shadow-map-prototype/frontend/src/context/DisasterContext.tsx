import React, { createContext, useContext, useState, useEffect } from 'react';

interface DisasterContextType {
    intensity: number;
    setIntensity: (value: number) => void;
    hazardType: 'general' | 'flood' | 'earthquake' | 'storm';
    setHazardType: (value: 'general' | 'flood' | 'earthquake' | 'storm') => void;
    isBlockageMode: boolean;
    setBlockageMode: (value: boolean) => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [intensity, setIntensity] = useState(25);
    const [hazardType, setHazardType] = useState<'general' | 'flood' | 'earthquake' | 'storm'>('general');
    const [isBlockageMode, setBlockageMode] = useState(false);

    // Provide logging for state changes to confirm event firing
    useEffect(() => {
        console.log(`[DisasterContext] State updated: ${intensity}% | Hazard: ${hazardType}`);
    }, [intensity, hazardType]);

    return (
        <DisasterContext.Provider value={{
            intensity, setIntensity,
            hazardType, setHazardType,
            isBlockageMode, setBlockageMode
        }}>
            {children}
        </DisasterContext.Provider>
    );
};

export const useDisaster = () => {
    const context = useContext(DisasterContext);
    if (!context) throw new Error('useDisaster must be used within a DisasterProvider');
    return context;
};
