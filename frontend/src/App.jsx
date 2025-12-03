// src/App.js

import React, { useState, useEffect } from 'react';
import Church from './components/Church'; // Login/Signup Component
import Home from './components/Home';     // Protected Component

const App = () => {
    // 1. State to hold user info and determine if they are logged in
    const [currentUserData, setCurrentUserData] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Check Local Storage on first load (Mount) to persist session
    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        const storedData = localStorage.getItem('userData');

        if (storedToken && storedData) {
            try {
                // Restore data from localStorage into React state
                const data = JSON.parse(storedData);
                setUserToken(storedToken);
                setCurrentUserData(data);
            } catch (error) {
                console.error("Failed to parse user data from storage:", error);
                // Clear corrupted storage data
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
            }
        }
        setIsLoading(false);
    }, []);

    // 3. Auth Success Handler (Passed to Church.jsx)
    const handleAuthSuccess = (userData, token) => {
        // Update App state upon successful login/signup, triggering render of Home
        setCurrentUserData(userData);
        setUserToken(token);
        // Note: Data is saved to localStorage inside Church.jsx
    };
    
    // 4. Logout Handler (Crucial for clearing session)
    const handleLogout = () => {
        setCurrentUserData(null);
        setUserToken(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
    };

    // 5. Loading state check (prevents flickering)
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100 text-xl text-gray-600">Loading...</div>;
    }

    // 6. Conditional Rendering/Routing
    if (currentUserData && userToken) {
        // Pass userData and the logout handler to the protected component
        return <Home userData={currentUserData} token={userToken} onLogout={handleLogout} />;
    }
    
    // Otherwise, render the Login/Signup page
    return <Church onAuthSuccess={handleAuthSuccess} />;
};

export default App;