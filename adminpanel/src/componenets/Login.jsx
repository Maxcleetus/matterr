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

// ✅ Login Page with Teal Theme
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
      const response = await fetch("https://matterr-backend-gut46zazm-maxcleetus-projects.vercel.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("userData", JSON.stringify(result.user || {}));
      
      if (result.user?._id) {
        localStorage.setItem("userId", result.user._id);
      }

      toast.success("Login successful! Redirecting...");
      
      // Small delay for user to see success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Catholic Family Registry
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
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
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <Button type="submit" loading={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>

            
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Secure access to family registry data
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

export default Login;