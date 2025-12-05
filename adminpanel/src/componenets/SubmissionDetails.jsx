import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAllContext } from "../AllContext/AllContext.jsx";
import {
  FaUser,
  FaPhone,
  FaChurch,
  FaCross,
  FaBirthdayCake,
  FaRing,
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaWater,
  FaStar,
  FaUsers,
  FaEdit
} from "react-icons/fa";

const SubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submissions } = useAllContext();
  const [submission, setSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const found = submissions.find((s) => s._id === id);
    const token = localStorage.getItem('token');

    if (found) {
      setSubmission(found);
    } else {
      // Check if token exists before making the request
      if (!token) {
        // Redirect to login if no token
        window.location.href = '/login';
        return;
      }

      fetch(`https://jinto-backend.vercel.app/api/submissions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((res) => {
          if (res.status === 401 || res.status === 403) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/login';
            return Promise.reject('Unauthorized');
          }

          if (!res.ok) {
            return Promise.reject(`HTTP error! status: ${res.status}`);
          }

          return res.json();
        })
        .then((data) => {
          if (data && data.data) {
            setSubmission(data.data);
          } else {
            console.error('Invalid response format:', data);
            navigate("/dashboard");
          }
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          navigate("/dashboard");
        });
    }
  }, [id, submissions, navigate]);

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

  if (!submission)
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading member details...</p>
        </div>
      </div>
    );

  const InfoCard = ({ title, children, icon, className = "" }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-200 ${className}`}>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const DetailItem = ({ icon, label, value, color = "text-gray-700" }) => (
    <div className="flex items-start gap-3">
      <div className="text-teal-600 mt-1">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className={`font-medium ${color}`}>{value || "N/A"}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4 sm:p-8 font-sans">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-2xl border-t-8 border-teal-700">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Photo Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div
                  className="w-36 h-36 rounded-full overflow-hidden border-4 border-teal-500 shadow-lg cursor-pointer hover:border-teal-600 transition-all duration-300"
                  onClick={() => setIsModalOpen(true)}
                >
                  <img
                    src={submission.photo || "https://via.placeholder.com/150/0d9488/ffffff?text=USER"}
                    alt={`${submission.name} ${submission.surname}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150/0d9488/ffffff?text=USER";
                    }}
                  />
                </div>
                {submission.status && (
                  <div className="absolute -bottom-2 -right-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-semibold rounded-full shadow">
                      {submission.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    {submission.name} {submission.surname}
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">{submission.familyName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="text-gray-600">{submission.presentPlace || submission.parishOrigin}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-sm text-gray-600">Role</div>
                  <div className="font-semibold text-gray-900">{submission.role || "Member"}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                  <div className="text-sm text-gray-600">Rite</div>
                  <div className="font-semibold text-gray-900">{submission.rite || "Not specified"}</div>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-100">
                  <div className="text-sm text-gray-600">Marital</div>
                  <div className="font-semibold text-gray-900">{submission.marriage ? "Married" : "Single"}</div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-100">
                  <div className="text-sm text-gray-600">Updated</div>
                  <div className="font-semibold text-gray-900">{formatDate(submission.updatedAt).split(',')[0]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-6">
          <InfoCard
            title="Personal Information"
            icon={<FaUser className="w-5 h-5 text-teal-600" />}
          >
            <DetailItem
              icon={<FaBirthdayCake />}
              label="Date of Birth"
              value={formatDate(submission.dob)}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaPhone />}
              label="Phone Number"
              value={submission.phone}
              color="text-blue-600"
            />
            <DetailItem
              icon={<FaUser />}
              label="Occupation"
              value={submission.occupation}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaUsers />}
              label="Family Role"
              value={submission.role}
              color="text-gray-900"
            />
          </InfoCard>

          <InfoCard
            title="Family Information"
            icon={<FaUsers className="w-5 h-5 text-teal-600" />}
          >
            <DetailItem
              icon={<FaUser className="text-blue-600" />}
              label="Father's Name"
              value={submission.father}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaUser className="text-pink-600" />}
              label="Mother's Name"
              value={submission.mother}
              color="text-gray-900"
            />
            {submission.spouse && (
              <DetailItem
                icon={<FaRing className="text-red-500" />}
                label="Spouse's Name"
                value={submission.spouse}
                color="text-gray-900"
              />
            )}
          </InfoCard>

          <InfoCard
            title="Location Details"
            icon={<FaMapMarkerAlt className="w-5 h-5 text-teal-600" />}
          >
            <DetailItem
              icon={<FaHome />}
              label="Current Place"
              value={submission.presentPlace}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaMapMarkerAlt />}
              label="Current Parish"
              value={submission.parish}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaMapMarkerAlt />}
              label="Current Diocese"
              value={submission.diocese}
              color="text-gray-900"
            />
            <div className="pt-3 border-t border-gray-100">
              <DetailItem
                icon={<FaMapMarkerAlt className="text-gray-500" />}
                label="Parish of Origin"
                value={submission.parishOrigin}
                color="text-gray-700"
              />
              <DetailItem
                icon={<FaMapMarkerAlt className="text-gray-500" />}
                label="Diocese of Origin"
                value={submission.dioceseOrigin}
                color="text-gray-700"
              />
            </div>
          </InfoCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <InfoCard
            title="Sacramental Records"
            icon={<FaCross className="w-5 h-5 text-teal-600" />}
          >
            <DetailItem
              icon={<FaWater className="text-blue-500" />}
              label="Baptism Date"
              value={formatDate(submission.baptism)}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaStar className="text-yellow-500" />}
              label="Confirmation Date"
              value={formatDate(submission.confirmation)}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaRing className="text-red-500" />}
              label="Marriage Date"
              value={submission.marriage ? formatDate(submission.marriage) : "Not married"}
              color={submission.marriage ? "text-gray-900" : "text-gray-500"}
            />
          </InfoCard>

          <InfoCard
            title="Church Affiliation"
            icon={<FaChurch className="w-5 h-5 text-teal-600" />}
          >
            <DetailItem
              icon={<FaCross />}
              label="Liturgical Rite"
              value={submission.rite}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaChurch />}
              label="Parish Community"
              value={submission.parish}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaChurch className="text-gray-500" />}
              label="Origin Parish"
              value={submission.parishOrigin}
              color="text-gray-700"
            />
          </InfoCard>

          <InfoCard
            title="Account Timeline"
            icon={<FaCalendarAlt className="w-5 h-5 text-teal-600" />}
          >
            <DetailItem
              icon={<FaCalendarAlt className="text-green-600" />}
              label="Record Created"
              value={formatDate(submission.createdAt)}
              color="text-gray-900"
            />
            <DetailItem
              icon={<FaCalendarAlt className="text-blue-600" />}
              label="Last Updated"
              value={formatDate(submission.updatedAt)}
              color="text-gray-900"
            />
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700 mb-1">Record Status</div>
                This member record is {submission.updatedAt === submission.createdAt ? 'new' : 'updated'}.
                All information is stored securely in the parish registry.
              </div>
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Modal for Full-size Photo */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={submission.photo || "https://via.placeholder.com/400/0d9488/ffffff?text=USER"}
              alt={`${submission.name} ${submission.surname}`}
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain"
            />
            <div className="text-white text-center mt-4">
              <p className="text-lg font-semibold">{submission.name} {submission.surname}</p>
              <p className="text-gray-300">{submission.familyName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetails;