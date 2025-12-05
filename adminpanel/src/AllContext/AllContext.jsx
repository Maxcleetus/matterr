// src/context/AllContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

const AllContext = createContext();

export const AllProvider = ({ children }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  
  // Use refs to prevent unnecessary re-renders
  const fetchCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // Memoize the fetch function to prevent recreation on every render
  const fetchSubmissions = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchCountRef.current > 0 && !isInitialFetch) {
      console.log("Fetch already in progress, skipping...");
      return;
    }

    try {
      fetchCountRef.current++;
      setLoading(true);
      
      // Get the JWT token from localStorage inside the function
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn("No authentication token found");
        if (isMountedRef.current) {
          setIsInitialFetch(false);
        }
        return;
      }

      console.log(`Fetching submissions... (count: ${fetchCountRef.current})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch("https://jinto-backend.vercel.app/api/submissions", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check for unauthorized responses
      if (res.status === 401 || res.status === 403) {
        console.warn("Unauthorized access - token expired or invalid");
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');
        window.location.href = '/';
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setSubmissions(data.data || []); // array from backend
      } else {
        console.error("❌ Failed to fetch:", data.error || data.message);
      }

      if (isMountedRef.current) {
        setIsInitialFetch(false);
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn("Request was aborted due to timeout");
      } else {
        console.error("❌ Fetch error:", err.message || err);
      }
    } finally {
      fetchCountRef.current--;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isInitialFetch]); // Only recreate when isInitialFetch changes

  // Initial fetch on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only fetch on initial mount, not on every render
    const token = localStorage.getItem('token');
    if (token && isInitialFetch) {
      fetchSubmissions();
    } else if (!token) {
      // If no token, mark initial fetch as done
      setIsInitialFetch(false);
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      fetchCountRef.current = 0;
    };
  }, [fetchSubmissions, isInitialFetch]);

  // Provide a refresh function that can be called manually
  const refreshSubmissions = useCallback(() => {
    setIsInitialFetch(true);
  }, []);

  return (
    <AllContext.Provider value={{ 
      submissions, 
      loading, 
      fetchSubmissions: refreshSubmissions, // Provide refresh function
      refreshSubmissions 
    }}>
      {children}
    </AllContext.Provider>
  );
};

// Hook to use context
export const useAllContext = () => {
  const context = useContext(AllContext);
  if (!context) {
    throw new Error("useAllContext must be used within an AllProvider");
  }
  return context;
};