import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../api/api";

const ReportContext = createContext<any>(null);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<any[]>([]);

  // Fetch reports initially
  const fetchReports = async () => {
    try {
      const res = await API.get("/reports");
      setReports(res.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const addReport = (report: any) => {
    setReports((prev) => {
      if (prev.find((r) => r._id === report._id)) return prev;
      return [...prev, report];
    });
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, fetchReports }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => useContext(ReportContext);
