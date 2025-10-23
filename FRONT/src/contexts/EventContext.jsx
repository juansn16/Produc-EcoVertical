import React, { createContext, useContext, useState, useCallback } from 'react';

const EventContext = createContext();

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext debe ser usado dentro de EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [gardenRefreshTrigger, setGardenRefreshTrigger] = useState(0);

  const triggerGardenRefresh = useCallback(() => {
    setGardenRefreshTrigger(prev => prev + 1);
  }, []);

  const value = {
    gardenRefreshTrigger,
    triggerGardenRefresh
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
