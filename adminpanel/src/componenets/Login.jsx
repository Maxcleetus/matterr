import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"; // Make sure you have heroicons installed

// ✅ Card Component
const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 bg-white/10 backdrop-blur-lg p-6 sm:p-8 ${className}`}
  >
    {children}
  </div>
);

// ✅ Button Component
const Button = ({ children, onClick, type = "button", className = "", loading = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className={`w-full sm:w-auto px-6 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold shadow-lg hover:scale-105 hover:opacity-90 transition transform relative ${loading ? "opacity-70 cursor-not-allowed" : ""
      } ${className}`}
  >
    {loading && (
      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
    )}
    <span className={loading ? "opacity-50" : ""}>{children}</span>
  </button>
);

// ✅ Input Component with Eye Toggle
const Input = ({ label, type = "text", value, onChange, placeholder, isPassword = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <label className="text-sm text-yellow-200">{label}</label>
      <div className="relative w-full">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 pr-10 py-2 sm:py-2.5 border border-gray-600 bg-gray-900/70 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition rounded-md text-sm sm:text-base"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition"
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

// ✅ Login Page
const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.warning("Both fields are required!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("token", result.token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-gray-900 via-black to-gray-800 bg-[length:300%_300%]" />

      {/* Card */}
      <Card className="w-full max-w-sm sm:max-w-md relative z-10 rounded-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 drop-shadow-lg text-center mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Enter your username"
          />
          <Input
            label="Password"
            type="password"
            isPassword={true}
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Enter your password"
          />

          <div className="flex justify-center mt-4">
            <Button type="submit" loading={loading}>
              Login
            </Button>
          </div>
        </form>
      </Card>

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
      />
    </div>
  );
};

export default Login;
