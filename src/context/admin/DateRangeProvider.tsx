"use client";

import React, { createContext, useContext, useState } from "react";

type DateRange = {
  from: Date | null;
  to: Date | null;
};

type DateRangeContextType = {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const DateRangeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
};
