import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllContext } from "../AllContext/AllContext.jsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { submissions, loading, fetchSubmissions } = useAllContext();
  const [filter, setFilter] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    married: 0,
    unmarried: 0,
    adults: 0,
    minors: 0,
    old: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false); // 🔥 new state

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data.user);
        await fetchSubmissions();
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (submissions.length === 0) return;

    const today = new Date();
    const total = submissions.length;
    const married = submissions.filter((s) => s.marriage).length;
    const unmarried = total - married;
    const adults = submissions.filter((s) => {
      const age = today.getFullYear() - new Date(s.dob).getFullYear();
      return age >= 18 && age < 60;
    }).length;
    const minors = total - adults;
    const old = submissions.filter((s) => today.getFullYear() - new Date(s.dob).getFullYear() >= 60).length;

    setStats({ total, married, unmarried, adults, minors, old });
  }, [submissions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem("token");
    try {
      setDeleting(true); // 🔥 show loading
      const res = await fetch(`http://localhost:5000/api/delete/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete submission");
      await fetchSubmissions();
      toast.success("Submission deleted successfully!");
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete submission");
    } finally {
      setDeleting(false); // 🔥 stop loading
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const today = new Date();
    const age = today.getFullYear() - new Date(s.dob).getFullYear();
    switch (filter) {
      case "married": return s.marriage;
      case "unmarried": return !s.marriage;
      case "adults": return age >= 18 && age < 60;
      case "minors": return age < 18;
      case "old": return age >= 60;
      default: return true;
    }
  });

  const pieData = [
    { name: "Married", value: stats.married },
    { name: "Unmarried", value: stats.unmarried },
    { name: "Adults", value: stats.adults },
    { name: "Minors", value: stats.minors },
    { name: "Old", value: stats.old },
  ];

  const COLORS = ["#facc15", "#f87171", "#60a5fa", "#34d399", "#a78bfa"];

  const barData = [
    { name: "Total", value: stats.total },
    { name: "Married", value: stats.married },
    { name: "Unmarried", value: stats.unmarried },
    { name: "Adults", value: stats.adults },
    { name: "Minors", value: stats.minors },
    { name: "Old", value: stats.old },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gray-900 text-white">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 p-4 bg-gray-800 rounded-lg shadow">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Dashboard</h1>
          <p className="text-gray-300 mt-1">
            Welcome, <span className="text-white font-semibold">{"Father"}</span>
          </p>
        </div>

        <button
          className="px-4 py-2 border border-red-500 text-red-500 rounded bg-transparent hover:bg-red-500 hover:text-white transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, key: "all" },
          { label: "Married", value: stats.married, key: "married" },
          { label: "Unmarried", value: stats.unmarried, key: "unmarried" },
          { label: "Adults", value: stats.adults, key: "adults" },
          { label: "Minors", value: stats.minors, key: "minors" },
          { label: "Old", value: stats.old, key: "old" },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`bg-gray-800 p-4 rounded-lg shadow text-center cursor-pointer transition
              ${filter === stat.key ? "border-2 border-yellow-400" : ""}
            `}
            onClick={() => setFilter(stat.key)}
          >
            <p className="text-gray-400">{stat.label}</p>
            <p className="text-yellow-400 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Graphs */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-yellow-400 mb-3">Pie Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-yellow-400 mb-3">Bar Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#facc15" />
              <YAxis stroke="#facc15" />
              <Tooltip />
              <Bar dataKey="value" fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submissions List */}
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Submissions</h2>
        {loading ? (
          <p>Loading submissions...</p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="text-gray-400">No submissions found.</p>
        ) : (
          <ul className="grid gap-4">
            {filteredSubmissions.map((s) => (
              <li
                key={s._id}
                className="p-4 rounded-lg bg-gray-800 shadow-md flex items-center justify-between cursor-pointer hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-4" onClick={() => navigate(`/submission/${s._id}`)}>
                  <img
                    src={s.photo}
                    alt={s.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div>
                    <p className="font-bold text-white">{s.name} {s.surname}</p>
                    <p className="text-gray-400 text-sm">{s.phone}</p>
                    <p className="text-gray-400 text-sm">{s.parish}</p>
                  </div>
                </div>
                <button
                  onClick={() => confirmDelete(s._id)}
                  className="text-red-500 hover:text-red-400 transition"
                >
                  <FaTrash size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Confirm Delete</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this submission?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded border border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${
                  deleting ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
