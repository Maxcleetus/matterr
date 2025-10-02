import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAllContext } from "../AllContext/AllContext.jsx";

const SubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submissions } = useAllContext();
  const [submission, setSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // For photo popup

  useEffect(() => {
    const found = submissions.find((s) => s._id === id);
    if (found) {
      setSubmission(found);
    } else {
      fetch(`http://localhost:5000/api/submissions/${id}`)
        .then((res) => res.json())
        .then((data) => setSubmission(data.data))
        .catch(() => navigate("/dashboard"));
    }
  }, [id, submissions, navigate]);

  if (!submission)
    return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full max-w-4xl mb-6 flex justify-start">
        <button
          className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-gray-900 transition"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col items-center mb-8 relative">
        <div
          className="w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg mb-4 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={submission.photo}
            alt={submission.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-yellow-400">{submission.name} {submission.surname}</h1>
        <p className="text-gray-400 mt-1">{submission.occupation}</p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <img
            src={submission.photo}
            alt={submission.name}
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Details Section */}
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 mb-8">
        {/* Personal Info */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-yellow-400 mb-3">Personal Information</h2>
          <p><strong>Date of Birth:</strong> {submission.dob}</p>
          <p><strong>Phone:</strong> {submission.phone}</p>
          <p><strong>Parish:</strong> {submission.parish}</p>
          <p><strong>Diocese:</strong> {submission.diocese}</p>
          <p><strong>Status:</strong> {submission.status}</p>
          <p><strong>Rite:</strong> {submission.rite}</p>
        </div>

        {/* Family Info */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-yellow-400 mb-3">Family Information</h2>
          <p><strong>Father:</strong> {submission.father}</p>
          <p><strong>Mother:</strong> {submission.mother}</p>
        </div>

        {/* Sacraments */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-yellow-400 mb-3">Sacraments</h2>
          <p><strong>Baptism:</strong> {submission.baptism}</p>
          <p><strong>Confirmation:</strong> {submission.confirmation}</p>
          <p><strong>Marriage:</strong> {submission.marriage || "N/A"}</p>
        </div>

        {/* Timeline */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-yellow-400 mb-3">Timeline</h2>
          <p><strong>Created At:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(submission.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
