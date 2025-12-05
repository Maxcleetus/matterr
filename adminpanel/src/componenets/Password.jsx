import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

// ✅ Card Component with Teal Theme
const Card = ({ children, className = "" }) => (
    <div
        className={`bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-t-8 border-teal-700 transition-shadow duration-300 hover:shadow-3xl ${className}`}
    >
        {children}
    </div>
);

// ✅ Button Component with Teal Theme
const Button = ({ children, onClick, type = "button", className = "", loading = false }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={loading}
        className={`w-full px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold shadow-lg hover:from-teal-700 hover:to-teal-600 hover:scale-[1.02] transition transform duration-200 relative ${loading ? "opacity-70 cursor-not-allowed" : ""
            } ${className}`}
    >
        {loading && (
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
        )}
        <span className={loading ? "opacity-50" : ""}>{children}</span>
    </button>
);

// ✅ Input Component with Eye Toggle - Teal Theme
const Input = ({ label, type = "text", value, onChange, placeholder, isPassword = false }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col gap-2 w-full relative">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="relative w-full">
                <input
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition rounded-md shadow-inner"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

// ✅ Password Reset Page with Teal Theme
const Password = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Define your backend endpoint
    const backendEndpoint = 'https://jinto-backend.vercel.app/api/reset'; // <--- CHANGE THIS


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 🔑 STEP 1: Retrieve the token from storage (CRITICAL FIX)
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            // Display error message if no token is found
            toast.error("Authentication required. Please log in first.");
            console.error("Error during password reset: No token found in localStorage.");
            return;
        }

        try {
            const response = await fetch(backendEndpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    // 🔑 STEP 2: Pass the token in the Authorization header (CRITICAL FIX)
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            setLoading(false);

            if (!response.ok) {
                // Attempt to parse error data for a friendly message
                const errorData = await response.json().catch(() => ({ message: 'Server error without message.' }));
                // The error message from the backend (e.g., "Not authorized, token failed")
                throw new Error(errorData.message || `Password reset failed with status: ${response.status}`);
            }

            const data = await response.json();

            console.log("Password reset successful:", data);
            toast.success("Password reset successfully! Redirecting to login...");

            // Optionally navigate back to the login page after success
            setTimeout(() => navigate("/dashboard"), 2000);

        } catch (err) {
            setLoading(false);
            toast.error(err.message || "An unexpected network error occurred. Please try again.");
            console.error("Error during password reset:", err);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Main Container */}
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                        Password Reset
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Enter your email and new password
                    </p>
                </div>

                {/* Password Reset Card */}
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                            <Input
                                label="New Password"
                                type="password"
                                isPassword={true}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your new password"
                            />
                        </div>

                        {/* Reset Password Button */}
                        <div className="pt-4">
                            <Button type="submit" loading={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </div>

                        {/* Back to Login Link */}
                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="text-teal-600 hover:text-teal-700 font-medium text-sm transition"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-600">
                        Secure password reset system
                    </p>
                    <p className="text-xs text-gray-500 mt-4">
                        © {new Date().getFullYear()} Catholic Family Registry
                    </p>
                </div>
            </div>

            {/* Toast Notifications */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default Password;