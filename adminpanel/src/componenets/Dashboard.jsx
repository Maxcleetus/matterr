import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAllContext } from "../AllContext/AllContext.jsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  FaTrash, FaEye, FaChurch, FaUsers, FaUser, FaCalendarAlt,
  FaPhone, FaHome, FaFilter, FaSearch, FaTimes, FaCross,
  FaToggleOn, FaToggleOff, FaEnvelope
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { submissions, loading, fetchSubmissions } = useAllContext();
  const [filter, setFilter] = useState("all");
  const [riteFilter, setRiteFilter] = useState("all");
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familySearch, setFamilySearch] = useState("");
  const [peopleSearch, setPeopleSearch] = useState("");
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [enableFeature, setEnableFeature] = useState(false);

  useEffect(() => {
    const fetchToggleState = async () => {
      const endpoint = "https://jinto-backend.vercel.app/api/toggle-feature";
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("Authentication token is missing. Cannot fetch feature state.");
        // Handle unauthorized state, e.g., redirect to login or set error state
        throw new Error("Missing authentication token.");
      }

      try {
        // Make a GET request
        const response = await fetch('https://jinto-backend.vercel.app/api/toggle-feature', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // <-- ADD THIS LINE
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check the response structure and update state
        if (data.success && typeof data.currentToggleState === 'boolean') {
          setEnableFeature(data.currentToggleState);
          console.log(`Initial toggle state loaded: ${data.currentToggleState}`);
        } else {
          console.error("API response missing 'currentToggleState'.");
        }

      } catch (error) {
        console.error("Failed to fetch initial toggle state:", error);
        // Optionally set state to a fallback value or show a toast error
      }
    };

    fetchToggleState();
    // Empty dependency array [] means this runs only once after the initial render
  }, []);


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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch("https://jinto-backend.vercel.app/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data.user);
        await fetchSubmissions();

        const savedToggleState = localStorage.getItem("dashboardFeatureToggle");
        if (savedToggleState !== null) {
          setEnableFeature(JSON.parse(savedToggleState));
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("dashboardFeatureToggle", JSON.stringify(enableFeature));
  }, [enableFeature]);

  const handleToggleFeature = async () => {
    const newState = !enableFeature;
    const endpoint = "https://jinto-backend.vercel.app/api/toggle-feature"; // Replace with your actual backend endpoint
    const token = localStorage.getItem('token');
    setEnableFeature(newState); // Optimistically update the UI state

    try {
      const response = await fetch(endpoint, {
        method: 'PUT', // Or 'PUT', depending on your API
        headers: {
          'Authorization': `Bearer ${token}`, // <-- ADD THIS LINE
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableFeature: newState, // The data you are sending to the backend
        }),
      });

      if (!response.ok) {
        // If the response status is not 2xx, throw an error
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Success notification after successful backend update
      if (newState) {
        // MODIFIED SUCCESS MESSAGE
        toast.success("Toggle feature **activated** and saved!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // MODIFIED INFO MESSAGE
        toast.info("Toggle feature **deactivated** and saved!", {
          position: "top-right",
          autoClose: 3000,
        });
      }

    } catch (error) {
      console.error("Failed to update feature state on backend:", error);

      // Revert the UI state on failure to synchronize with the backend
      setEnableFeature(!newState);

      // Show an error notification
      // MODIFIED ERROR MESSAGE for clarity
      toast.error("Failed to save changes for the toggle feature. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

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
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
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
      setDeleting(true);
      const res = await fetch(`https://jinto-backend.vercel.app/api/delete/${deleteId}`, {
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
      setDeleting(false);
    }
  };

  const families = useMemo(() => {
    return submissions.reduce((acc, submission) => {
      const familyName = submission.familyName || "Unknown Family";
      if (!acc[familyName]) {
        acc[familyName] = [];
      }
      acc[familyName].push(submission);
      return acc;
    }, {});
  }, [submissions]);

  const familyList = useMemo(() => {
    return Object.entries(families)
      .map(([familyName, members]) => ({
        familyName,
        memberCount: members.length,
        members: members.sort((a, b) => {
          const roleOrder = { father: 1, mother: 2, husband: 3, wife: 4, child: 5, self: 6, grandparent: 7 };
          return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
        })
      }))
      .sort((a, b) => b.memberCount - a.memberCount);
  }, [families]);

  const riteStats = useMemo(() => {
    const riteCounts = {};
    submissions.forEach(submission => {
      const rite = submission.rite || "Unknown";
      riteCounts[rite] = (riteCounts[rite] || 0) + 1;
    });

    return Object.entries(riteCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [submissions]);

  const uniqueRites = [...new Set(submissions.map(s => s.rite).filter(Boolean))].sort();

  const filteredFamilyList = useMemo(() => {
    if (!familySearch.trim()) return familyList;
    const searchTerm = familySearch.toLowerCase();
    return familyList.filter(family => {
      const familyName = family.familyName || "";
      const familyNameMatch = familyName.toLowerCase().includes(searchTerm);
      const memberMatch = family.members.some(member => {
        const name = member.name || "";
        const surname = member.surname || "";
        const email = member.email || "";
        return name.toLowerCase().includes(searchTerm) || 
               surname.toLowerCase().includes(searchTerm) ||
               email.toLowerCase().includes(searchTerm);
      });
      return familyNameMatch || memberMatch;
    });
  }, [familyList, familySearch]);

  const filteredSubmissions = submissions.filter((s) => {
    const today = new Date();
    const age = today.getFullYear() - new Date(s.dob).getFullYear();

    let maritalMatch = true;
    switch (filter) {
      case "married": maritalMatch = s.marriage; break;
      case "unmarried": maritalMatch = !s.marriage; break;
      case "adults": maritalMatch = age >= 18 && age < 60; break;
      case "minors": maritalMatch = age < 18; break;
      case "old": maritalMatch = age >= 60; break;
      default: maritalMatch = true;
    }

    let riteMatch = true;
    if (riteFilter !== "all") {
      riteMatch = s.rite === riteFilter;
    }

    return maritalMatch && riteMatch;
  });

  const searchedPeople = useMemo(() => {
    if (!peopleSearch.trim()) return filteredSubmissions;
    const searchTerm = peopleSearch.toLowerCase();
    return filteredSubmissions.filter(person => {
      const name = person.name || "";
      const surname = person.surname || "";
      const email = person.email || "";
      const phone = person.phone || "";
      const parish = person.parish || "";
      return name.toLowerCase().includes(searchTerm) ||
        surname.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm) ||
        phone.toLowerCase().includes(searchTerm) ||
        parish.toLowerCase().includes(searchTerm);
    });
  }, [filteredSubmissions, peopleSearch]);

  const viewFamilyMembers = (family) => {
    setSelectedFamily(family);
    setShowFamilyModal(true);
  };

  const viewMemberDetails = (member) => {
    setSelectedMember(member);
    setShowMemberDetails(true);
  };

  const pieData = [
    { name: "Married", value: stats.married },
    { name: "Unmarried", value: stats.unmarried },
    { name: "Adults", value: stats.adults },
    { name: "Minors", value: stats.minors },
    { name: "Seniors", value: stats.old },
  ];

  const COLORS = ["#0d9488", "#14b8a6", "#0ea5e9", "#8b5cf6", "#f59e0b"];
  const RITE_COLORS = ["#0d9488", "#14b8a6", "#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  const barData = [
    { name: "Total", value: stats.total },
    { name: "Married", value: stats.married },
    { name: "Unmarried", value: stats.unmarried },
    { name: "Adults", value: stats.adults },
    { name: "Minors", value: stats.minors },
    { name: "Seniors", value: stats.old },
  ];

  const statCards = [
    { label: "Total Members", value: stats.total, key: "all", icon: <FaUsers className="text-teal-500" />, bg: "bg-gradient-to-r from-teal-50 to-cyan-50" },
    { label: "Married", value: stats.married, key: "married", icon: <FaUser className="text-teal-600" />, bg: "bg-gradient-to-r from-blue-50 to-teal-50" },
    { label: "Unmarried", value: stats.unmarried, key: "unmarried", icon: <FaUser className="text-blue-600" />, bg: "bg-gradient-to-r from-cyan-50 to-blue-50" },
    { label: "Adults", value: stats.adults, key: "adults", icon: <FaUser className="text-indigo-500" />, bg: "bg-gradient-to-r from-indigo-50 to-purple-50" },
    { label: "Minors", value: stats.minors, key: "minors", icon: <FaUser className="text-purple-500" />, bg: "bg-gradient-to-r from-purple-50 to-pink-50" },
    { label: "Seniors", value: stats.old, key: "old", icon: <FaCalendarAlt className="text-amber-500" />, bg: "bg-gradient-to-r from-amber-50 to-orange-50" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4 sm:p-8 font-sans">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-2xl border-t-8 border-teal-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome, <span className="text-teal-700 font-semibold">{user?.role || "Administrator"}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Records: <span className="font-semibold">{submissions.length}</span> submissions |
                Families: <span className="font-semibold">{familyList.length}</span> |
                Liturgical Rites: <span className="font-semibold">{riteStats.length}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleToggleFeature}
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition ${enableFeature
                  ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md hover:from-teal-700 hover:to-teal-600"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400"
                  }`}
              >
                {enableFeature ? (
                  <>
                    <FaToggleOn className="text-xl" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <FaToggleOff className="text-xl" />
                    <span>Disabled</span>
                  </>
                )}
              </button>

              <button
                className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center gap-2 shadow"
              >
                Welcome
              </button>
              <button
                className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center gap-2 shadow"
                onClick={() => navigate("/reset")}>
                Reset
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-red-500 text-red-600 font-medium rounded-lg hover:bg-red-50 transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Search Section */}
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaSearch className="text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Search Members</h2>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, phone, parish..."
                  value={peopleSearch}
                  onChange={(e) => setPeopleSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {peopleSearch && (
                  <button
                    onClick={() => setPeopleSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {peopleSearch ? `Found ${searchedPeople.length} members` : `Total: ${submissions.length} members`}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaHome className="text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Search Families</h2>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search family name or member..."
                  value={familySearch}
                  onChange={(e) => setFamilySearch(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {familySearch && (
                  <button
                    onClick={() => setFamilySearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {familySearch ? `Found ${filteredFamilyList.length} families` : `Total: ${familyList.length} families`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            className={`${stat.bg} p-5 rounded-xl shadow-lg border border-white cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${filter === stat.key ? "ring-2 ring-teal-500" : ""
              }`}
            onClick={() => setFilter(stat.key)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="text-2xl">
                {stat.icon}
              </div>
            </div>
            <div className={`h-2 mt-4 rounded-full ${filter === stat.key ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>

      {/* Family List Section */}
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaHome className="text-teal-600 text-xl" />
                <h2 className="text-2xl font-bold text-gray-900">Family Groups</h2>
              </div>
              <p className="text-gray-600">
                Click on a family name to view all members
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredFamilyList.length} families found
            </div>
          </div>

          {filteredFamilyList.length === 0 ? (
            <div className="text-center py-8">
              <FaHome className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500">No family groups found</p>
              {familySearch && (
                <button
                  onClick={() => setFamilySearch("")}
                  className="mt-2 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredFamilyList.slice(0, 8).map((family, index) => (
                <div
                  key={index}
                  onClick={() => viewFamilyMembers(family)}
                  className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <FaHome className="text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 truncate max-w-[150px]">
                          {family.familyName}
                        </h3>
                        <p className="text-xs text-gray-500">{family.memberCount} members</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {family.members.slice(0, 3).map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <img
                            src={member.photo || "https://via.placeholder.com/24/0d9488/ffffff"}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-gray-700 truncate">{member.name}</span>
                        <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                          {member.role || 'member'}
                        </span>
                      </div>
                    ))}
                    {family.memberCount > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{family.memberCount - 3} more members
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredFamilyList.length > 8 && (
                <div className="col-span-full text-center pt-4">
                  <button
                    onClick={() => setShowFamilyModal(true)}
                    className="text-teal-600 hover:text-teal-800 font-medium"
                  >
                    View all {filteredFamilyList.length} families →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="w-full max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Demographic</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                fill="#8884d8"
                label={(entry) => `${entry.value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, "Count"]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
              />
              <Tooltip
                formatter={(value) => [value, "Count"]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar
                dataKey="value"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <FaChurch className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Liturgical Rites</h2>
          </div>
          {riteStats.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-gray-500">No rite data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={riteStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                />
                <Tooltip
                  formatter={(value) => [value, "Members"]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar
                  dataKey="value"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Members"
                >
                  {riteStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RITE_COLORS[index % RITE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-teal-600" />
            <h2 className="text-xl font-bold text-gray-900">Filter Members</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-600 mb-2">By Marital Status:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "all" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("married")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "married" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Married
                </button>
                <button
                  onClick={() => setFilter("unmarried")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "unmarried" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Unmarried
                </button>
                <button
                  onClick={() => setFilter("adults")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "adults" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Adults
                </button>
                <button
                  onClick={() => setFilter("minors")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "minors" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Minors
                </button>
                <button
                  onClick={() => setFilter("old")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "old" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Seniors
                </button>
              </div>
            </div>

            <div className="ml-0 lg:ml-6">
              <p className="text-sm text-gray-600 mb-2">By Liturgical Rite:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRiteFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${riteFilter === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  All Rites
                </button>
                {uniqueRites.map((rite) => (
                  <button
                    key={rite}
                    onClick={() => setRiteFilter(rite)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${riteFilter === rite ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {rite}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Showing {searchedPeople.length} members
            {filter !== 'all' && ` (${filter})`}
            {riteFilter !== 'all' && ` (Rite: ${riteFilter})`}
            {peopleSearch && ` matching "${peopleSearch}"`}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Rite Distribution: {riteStats.map(r => `${r.name}: ${r.value}`).join(', ')}
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Family Registry Members</h2>
              <p className="text-gray-600 mt-1">
                Showing {searchedPeople.length} of {submissions.length} records
                {filter !== 'all' && ` (Filtered by: ${filter})`}
                {riteFilter !== 'all' && ` (Rite: ${riteFilter})`}
                {peopleSearch && ` matching "${peopleSearch}"`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading submissions...</p>
              </div>
            </div>
          ) : searchedPeople.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FaUsers className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600">
                {peopleSearch || filter !== 'all' || riteFilter !== 'all'
                  ? `No members match the selected filters.`
                  : "No members in the registry yet."}
              </p>
              {(peopleSearch || filter !== 'all' || riteFilter !== 'all') && (
                <button
                  onClick={() => {
                    setFilter("all");
                    setRiteFilter("all");
                    setPeopleSearch("");
                  }}
                  className="mt-3 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchedPeople.map((s) => (
                <div
                  key={s._id}
                  className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={s.photo || "https://via.placeholder.com/80/0d9488/ffffff?text=USER"}
                        alt={`${s.name} ${s.surname}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 cursor-pointer"
                        onClick={() => viewMemberDetails(s)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/80/0d9488/ffffff?text=USER";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className="font-bold text-gray-900 text-lg truncate cursor-pointer hover:text-teal-700"
                            onClick={() => viewMemberDetails(s)}
                          >
                            {s.name} {s.surname}
                          </h3>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-600 text-sm">{s.familyName}</p>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              {s.role || 'member'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/submission/${s._id}`)}
                            className="text-teal-600 hover:text-teal-800 transition p-1"
                            title="View Full Details"
                          >
                            <FaEye size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(s._id)}
                            className="text-red-500 hover:text-red-700 transition p-1"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaEnvelope className="w-3 h-3" />
                          <span className="truncate">{s.email || "No email"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaPhone className="w-3 h-3" />
                          <span>{s.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaChurch className="w-3 h-3" />
                          <span className="truncate">{s.parish || "No parish"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaCross className="w-3 h-3" />
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                            {s.rite || "No rite"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Family Members Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <FaHome className="text-teal-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedFamily ? selectedFamily.familyName : "All Families"}
                    </h2>
                    <p className="text-gray-600">
                      {selectedFamily
                        ? `${selectedFamily.memberCount} family members`
                        : `${filteredFamilyList.length} families registered`
                      }
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFamilyModal(false);
                  setSelectedFamily(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {(!selectedFamily ? filteredFamilyList : [selectedFamily]).map((family, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{family.familyName}</h3>
                    <span className="text-sm text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                      {family.memberCount} members
                    </span>
                  </div>
                  <div className="space-y-3">
                    {family.members.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => viewMemberDetails(member)}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={member.photo || "https://via.placeholder.com/48/0d9488/ffffff"}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-900">{member.name} {member.surname}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${member.role === 'father' ? 'bg-blue-100 text-blue-700' :
                              member.role === 'mother' ? 'bg-pink-100 text-pink-700' :
                                member.role === 'child' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {member.role || 'member'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {member.email && `📧 ${member.email}`}
                            {member.phone && ` | 📱 ${member.phone}`}
                            {member.parish && ` | ⛪ ${member.parish}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!selectedFamily && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowFamilyModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberDetails && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-teal-500">
                  <img
                    src={selectedMember.photo || "https://via.placeholder.com/80/0d9488/ffffff?text=USER"}
                    alt={`${selectedMember.name} ${selectedMember.surname}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedMember.name} {selectedMember.surname}
                  </h2>
                  <p className="text-gray-600">{selectedMember.familyName}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${selectedMember.role === 'father' ? 'bg-blue-100 text-blue-700' :
                      selectedMember.role === 'mother' ? 'bg-pink-100 text-pink-700' :
                        selectedMember.role === 'child' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {selectedMember.role || 'member'}
                    </span>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                      {selectedMember.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMemberDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-600">Email:</span> {selectedMember.email || "N/A"}</p>
                    <p className="text-sm"><span className="text-gray-600">Date of Birth:</span> {formatDate(selectedMember.dob)}</p>
                    <p className="text-sm"><span className="text-gray-600">Phone:</span> {selectedMember.phone || "N/A"}</p>
                    <p className="text-sm"><span className="text-gray-600">Occupation:</span> {selectedMember.occupation || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Family Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-600">Father:</span> {selectedMember.father || "N/A"}</p>
                    <p className="text-sm"><span className="text-gray-600">Mother:</span> {selectedMember.mother || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Church Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-600">Parish:</span> {selectedMember.parish || "N/A"}</p>
                    <p className="text-sm"><span className="text-gray-600">Diocese:</span> {selectedMember.diocese || "N/A"}</p>
                    <p className="text-sm"><span className="text-gray-600">Rite:</span> {selectedMember.rite || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sacraments</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-600">Baptism:</span> {formatDate(selectedMember.baptism)}</p>
                    <p className="text-sm"><span className="text-gray-600">Confirmation:</span> {formatDate(selectedMember.confirmation)}</p>
                    <p className="text-sm"><span className="text-gray-600">Marriage:</span> {selectedMember.marriage ? formatDate(selectedMember.marriage) : "Not married"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created: {formatDate(selectedMember.createdAt)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/submission/${selectedMember._id}`)}
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
                  >
                    View Full Profile
                  </button>
                  <button
                    onClick={() => setShowMemberDetails(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <FaTrash className="text-red-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Deletion</h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this member record? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 ${deleting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                  }`}
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;