import React, { createContext, useState, useContext } from "react";

const ReportContext = createContext<any>(null);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<any[]>([]);

  const addReport = (report: any) => {
    setReports((prev) => {
      // Prevent duplicates
      if (prev.find((r) => r._id === report._id)) return prev;
      return [...prev, report];
    });
  };

  return (
    <ReportContext.Provider value={{ reports, addReport }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => useContext(ReportContext);
