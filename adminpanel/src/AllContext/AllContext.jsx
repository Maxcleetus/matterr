// src/context/AllContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AllContext = createContext();

export const AllProvider = ({ children }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://matterr-backend-gut46zazm-maxcleetus-projects.vercel.app/api/submissions");
      const data = await res.json();

      if (data.success) {
        setSubmissions(data.data); // array from backend
      } else {
        console.error("❌ Failed to fetch:", data.error);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <AllContext.Provider value={{ submissions, loading, fetchSubmissions }}>
      {children}
    </AllContext.Provider>
  );
};

// Hook to use context
export const useAllContext = () => useContext(AllContext);
