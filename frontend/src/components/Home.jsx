// src/components/Home.jsx (Edit/View Toggle Mode - Saves to Local Storage & Database)

import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Utility & Theming Classes ---
const cardBaseClasses = "bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-t-8 border-teal-700 transition-shadow duration-300";
const detailLabelClasses = "text-sm font-semibold text-gray-500 uppercase tracking-wider";
const detailValueClasses = "text-base text-gray-800 break-words";
const sectionTitleClasses = "text-xl font-extrabold text-teal-800 mt-6 mb-4 border-b-2 border-teal-100 pb-2 flex items-center";
const inputBaseClasses = "w-full max-w-full px-3 py-2 border border-gray-300 bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition rounded-md shadow-inner text-sm";
const labelBaseClasses = "text-sm font-medium text-gray-700";

// --- Dropdown Options ---
const statusOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "religious", label: "Religious/Clergy" },
    { value: "other", label: "Other" },
];
const roleOptions = [
    { value: "self", label: "Self" },
    { value: "husband", label: "Husband" },
    { value: "wife", label: "Wife" },
    { value: "father", label: "Father" },
    { value: "mother", label: "Mother" },
    { value: "child", label: "Child" },
    { value: "grandparent", label: "Grandparent" },
];
const riteOptions = [
    { value: "latin", label: "Latin Catholic" },
    { value: "roman", label: "Roman Catholic (Ordinary Form)" },
    { value: "syro-malabar", label: "Syro-Malabar" },
    { value: "syro-malankara", label: "Syro-Malankara" },
    { value: "melkite", label: "Melkite" },
    { value: "maronite", label: "Maronite" },
    { value: "ukrainian", label: "Ukrainian Greek Catholic" },
    { value: "coptic", label: "Coptic Catholic" },
    { value: "ethiopian", label: "Ethiopian Catholic" },
    { value: "chaldean", label: "Chaldean Catholic" },
    { value: "other_eastern", label: "Other Eastern Rite" },
];

// --- Icon Components ---
const Icon = ({ children }) => <span className="mr-2 text-teal-600">{children}</span>;
const UserIcon = () => <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></Icon>;
const ChurchIcon = () => <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a9 9 0 00-9 9c0 4.2 2.6 7.8 6 9.2V22h6v-1.8c3.4-1.4 6-5 6-9.2a9 9 0 00-9-9zM12 13a2 2 0 110-4 2 2 0 010 4z" /></svg></Icon>;
const SacramentIcon = () => <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></Icon>;

// --- Helper Components ---

// Component for View-Only Mode
const DetailItem = ({ label, value, fallback = "N/A" }) => (
    <div>
        <div className={detailLabelClasses}>{label}</div>
        <div className={detailValueClasses}>{value || fallback}</div>
    </div>
);

const EditInput = ({ label, type = "text", value, onChange, field, required = false, disabled = false }) => (
    <div className="flex flex-col gap-1">
        <label className={labelBaseClasses}>
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            required={required}
            className={inputBaseClasses}
            disabled={disabled || field === 'email' || field === 'familyName'}
        />
    </div>
);

// Component for Edit Mode
const EditSelect = ({ label, value, onChange, options, field, required = false }) => (
    <div className="flex flex-col gap-1">
        <label className={labelBaseClasses}>
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <select
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            required={required}
            className={`${inputBaseClasses} appearance-none cursor-pointer pr-8 bg-white`}
        >
            <option value="" disabled>Select {label}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

// --- DATE FORMATTING UTILITIES ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateString;
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

// Helper function to get initial data from localStorage
const getInitialData = () => {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : {};
};

// API base URL
const API_BASE_URL = 'https://jinto-backend.vercel.app/api';

// --- Main Component ---
const Home = ({ onLogout }) => {
    // State to hold the official, saved data (from Local Storage)
    const [profileData, setProfileData] = useState(getInitialData);
    // State to hold data currently being edited (form inputs)
    const [editForm, setEditForm] = useState(getInitialData);
    // State to control the view/edit mode
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState(null);
    const [istoggle, setIstoogle] = useState(false);

    useEffect(() => {
        const fetchToggleState = async () => {
            
            const token = localStorage.getItem('userToken')

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
                    setIstoogle(data.currentToggleState);
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

    // Sync on initial load
    useEffect(() => {
        const initialData = getInitialData();
        setProfileData(initialData);
        setEditForm(initialData);

        // Get user ID from localStorage or profile data
        const storedUserId = localStorage.getItem('userId') || initialData._id;
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    // Determine which data set to display based on mode
    const displayData = editMode ? editForm : profileData;

    const {
        name, surname, familyName,
        email, phone, photo, occupation, status,
        rite, dob, baptism, confirmation, marriage,
        parishOrigin, dioceseOrigin, parish, diocese, presentPlace,
        father, mother, role,
        createdAt, updatedAt
    } = displayData;

    const fullName = `${name || ''} ${surname || ''}`.trim();
    const photoSrc = photo || "https://via.placeholder.com/150/0d9488/ffffff?text=PROFILE";

    // --- Handlers ---
    const toggleEditMode = () => {
        setEditMode(prev => {
            if (prev) {
                // EXITING EDIT MODE (CANCEL)
                setEditForm(profileData);
                toast.info("Editing cancelled. Changes reverted.");
            } else {
                // ENTERING EDIT MODE
                setEditForm({ ...profileData });
            }
            return !prev;
        });
    };

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    // Function to save to database
    const saveToDatabase = async (userData) => {
        try {
            // Get auth token from localStorage
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const response = await fetch(`${API_BASE_URL}/user/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Database save error:', error);
            throw error;
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // 1. Prepare data with timestamp
            const updatedData = {
                ...editForm,
                updatedAt: new Date().toISOString()
            };

            // Remove fields that shouldn't be sent to the server
            const dataToSend = { ...updatedData };
            delete dataToSend._id; // Let the server handle the ID
            delete dataToSend.__v; // Remove version key if present
            delete dataToSend.createdAt; // Server should maintain this
            delete dataToSend.password; // Never send password back

            // 2. Save to Local Storage first (for immediate feedback)
            setProfileData(updatedData);
            localStorage.setItem('userData', JSON.stringify(updatedData));

            // 3. Save to Database
            toast.info("Saving to database...");
            const dbResult = await saveToDatabase(dataToSend);

            // 4. Update local data with server response (in case server made changes)
            if (dbResult.user) {
                const serverData = {
                    ...updatedData,
                    ...dbResult.user,
                    updatedAt: dbResult.user.updatedAt || updatedData.updatedAt
                };

                setProfileData(serverData);
                localStorage.setItem('userData', JSON.stringify(serverData));

                // Update userId if server returned it
                if (dbResult.user._id) {
                    setUserId(dbResult.user._id);
                    localStorage.setItem('userId', dbResult.user._id);
                }
            }

            toast.success("Profile updated successfully! (Saved to database)");
            setEditMode(false);

        } catch (error) {
            console.error("Save error:", error);

            // Show appropriate error message
            if (error.message.includes('authentication') || error.message.includes('token')) {
                toast.error("Session expired. Please login again.");
                setTimeout(() => {
                    onLogout();
                }, 2000);
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                toast.warning("Changes saved locally. Could not connect to server.");
                // Keep changes in local storage even if server failed
                setEditMode(false);
            } else {
                toast.error(`Save failed: ${error.message}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // --- Loading State ---
    if (!name && !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="flex items-center space-x-3 bg-white p-6 rounded-lg shadow-xl border-t-4 border-teal-600">
                    <div className="border-4 border-teal-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
                    <span className="text-xl font-medium text-gray-700">Loading User Profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans flex items-start justify-center">
            <div className={`w-full max-w-6xl mt-12 ${cardBaseClasses}`}>
                {/* --- HEADER & PROFILE SUMMARY --- */}
                <header className="flex flex-col sm:flex-row justify-between items-start mb-8 border-b border-gray-200 pb-6">
                    <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-teal-600 shadow-lg flex-shrink-0">
                            <img
                                src={photoSrc}
                                alt={`${fullName} Profile`}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150/0d9488/ffffff?text=PROFILE" }}
                            />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                {editMode ? 'Editing Profile' : 'Profile View'}
                            </h1>
                            <p className="text-xl text-teal-600 font-semibold mt-1">
                                {email}
                            </p>
                            <p className="text-md text-gray-500 mt-0.5">
                                Status: {status?.toUpperCase()}
                                {userId && (
                                    <span className="ml-4 text-xs text-gray-400">
                                        ID: {userId.substring(0, 8)}...
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* --- BUTTONS: Edit/Save/Cancel/Logout --- */}
                    <div className="flex space-x-3 self-start sm:self-center">
                        {!editMode ? (
                            <>
                                {istoggle && <button
                                    type="button"
                                    onClick={toggleEditMode}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H10v-1.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </button>}
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center text-sm ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {isSaving ? 'Saving to Database...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleEditMode}
                                    disabled={isSaving}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* --- DASHBOARD CONTENT - CONDITIONAL RENDERING --- */}
                <div className="grid grid-cols-1 gap-8">
                    {editMode ? (
                        // EDIT MODE: Show form for editing
                        <form
                            onSubmit={handleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.type !== 'textarea') {
                                    e.preventDefault();
                                }
                            }}
                        >
                            {/* SECTION 1: IDENTITY & PROFESSIONAL */}
                            <section className="p-4 bg-teal-50/50 rounded-xl shadow-inner border-l-4 border-teal-300">
                                <h2 className={sectionTitleClasses}><UserIcon /> Identity & Professional Profile</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                    <EditInput label="First Name" field="name" value={name} onChange={handleEditChange} required />
                                    <EditInput label="Surname" field="surname" value={surname} onChange={handleEditChange} required />
                                    <EditInput label="Date of Birth" field="dob" type="date" value={formatDateForInput(dob)} onChange={handleEditChange} required />
                                    <EditSelect label="Marital Status" field="status" value={status} onChange={handleEditChange} options={statusOptions} required />
                                    <EditInput label="Occupation / Field" field="occupation" value={occupation} onChange={handleEditChange} />
                                    <EditInput label="Phone Number" field="phone" value={phone} onChange={handleEditChange} required />
                                    <EditInput label="Family Name (Immutable)" field="familyName" value={familyName} onChange={handleEditChange} disabled />
                                    <EditSelect label="Role in Family" field="role" value={role} onChange={handleEditChange} options={roleOptions} required />
                                </div>
                            </section>

                            {/* SECTION 2: CHURCH AFFILIATION & LOCATION */}
                            <section className="p-4 bg-gray-50/50 rounded-xl shadow-inner border-l-4 border-gray-300">
                                <h2 className={sectionTitleClasses}><ChurchIcon /> Church Affiliation & Location</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                    <EditSelect label="Liturgical Rite" field="rite" value={rite} onChange={handleEditChange} options={riteOptions} required />
                                    <EditInput label="Parish of Origin" field="parishOrigin" value={parishOrigin} onChange={handleEditChange} />
                                    <EditInput label="Diocese of Origin" field="dioceseOrigin" value={dioceseOrigin} onChange={handleEditChange} />
                                    <EditInput label="Current Place" field="presentPlace" value={presentPlace} onChange={handleEditChange} />
                                    <EditInput label="Current Parish" field="parish" value={parish} onChange={handleEditChange} />
                                    <EditInput label="Current Diocese" field="diocese" value={diocese} onChange={handleEditChange} />
                                </div>
                            </section>

                            {/* SECTION 3: SACRAMENTAL RECORDS */}
                            <section className="p-4 bg-teal-50/50 rounded-xl shadow-inner border-l-4 border-teal-300">
                                <h2 className={sectionTitleClasses}><SacramentIcon /> Sacramental Records</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                                    <EditInput label="Date of Baptism" field="baptism" type="date" value={formatDateForInput(baptism)} onChange={handleEditChange} required />
                                    <EditInput label="Date of Confirmation" field="confirmation" type="date" value={formatDateForInput(confirmation)} onChange={handleEditChange} required />
                                    <EditInput label="Date of Marriage" field="marriage" type="date" value={formatDateForInput(marriage)} onChange={handleEditChange} />
                                </div>
                            </section>

                            {/* SECTION 4: IMMEDIATE FAMILY */}
                            <section className="p-4 bg-gray-50/50 rounded-xl shadow-inner border-l-4 border-gray-300">
                                <h2 className={sectionTitleClasses}><UserIcon /> Immediate Family</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                    <EditInput label="Father's Full Name" field="father" value={father} onChange={handleEditChange} required />
                                    <EditInput label="Mother's Full Name" field="mother" value={mother} onChange={handleEditChange} />
                                </div>
                            </section>
                        </form>
                    ) : (
                        // VIEW MODE: Show read-only details
                        <>
                            {/* SECTION 1: IDENTITY & PROFESSIONAL */}
                            <section className="p-4 bg-teal-50/50 rounded-xl shadow-inner border-l-4 border-teal-300">
                                <h2 className={sectionTitleClasses}><UserIcon /> Identity & Professional Profile</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                    <DetailItem label="First Name" value={name} />
                                    <DetailItem label="Surname" value={surname} />
                                    <DetailItem label="Date of Birth" value={formatDate(dob)} />
                                    <DetailItem label="Marital Status" value={status?.toUpperCase()} />
                                    <DetailItem label="Occupation / Field" value={occupation} />
                                    <DetailItem label="Phone Number" value={phone} />
                                    <DetailItem label="Family Name (Origin)" value={familyName} />
                                    <DetailItem label="Role in Family" value={role} />
                                </div>
                            </section>

                            {/* SECTION 2: CHURCH AFFILIATION & LOCATION */}
                            <section className="p-4 bg-gray-50/50 rounded-xl shadow-inner border-l-4 border-gray-300">
                                <h2 className={sectionTitleClasses}><ChurchIcon /> Church Affiliation & Location</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                    <DetailItem label="Liturgical Rite" value={rite} />
                                    <DetailItem label="Parish of Origin" value={parishOrigin} />
                                    <DetailItem label="Diocese of Origin" value={dioceseOrigin} />
                                    <DetailItem label="Current Place" value={presentPlace} />
                                    <DetailItem label="Current Parish" value={parish} />
                                    <DetailItem label="Current Diocese" value={diocese} />
                                </div>
                            </section>

                            {/* SECTION 3: SACRAMENTAL RECORDS */}
                            <section className="p-4 bg-teal-50/50 rounded-xl shadow-inner border-l-4 border-teal-300">
                                <h2 className={sectionTitleClasses}><SacramentIcon /> Sacramental Records</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                                    <DetailItem label="Date of Baptism" value={formatDate(baptism)} />
                                    <DetailItem label="Date of Confirmation" value={formatDate(confirmation)} />
                                    <DetailItem label="Date of Marriage" value={formatDate(marriage)} fallback="Unmarried" />
                                </div>
                            </section>

                            {/* SECTION 4: IMMEDIATE FAMILY */}
                            <section className="p-4 bg-gray-50/50 rounded-xl shadow-inner border-l-4 border-gray-300">
                                <h2 className={sectionTitleClasses}><UserIcon /> Immediate Family</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                    <DetailItem label="Father's Full Name" value={father} />
                                    <DetailItem label="Mother's Full Name" value={mother} />
                                </div>
                            </section>
                        </>
                    )}

                    {/* SECTION 5: ACCOUNT METADATA (Always View Only) */}
                    <section className="p-4 bg-gray-100 rounded-xl border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-700 mb-2">Account Metadata</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div>
                                <div className={detailLabelClasses}>ACCOUNT CREATED</div>
                                <div className={detailValueClasses}>{formatDate(createdAt)}</div>
                            </div>
                            <div>
                                <div className={detailLabelClasses}>LAST UPDATED</div>
                                <div className={detailValueClasses}>{formatDate(updatedAt)}</div>
                            </div>
                            <div>
                                <div className={detailLabelClasses}>EMAIL</div>
                                <div className={detailValueClasses}>{email}</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                            Data synchronized with database server
                        </div>
                    </section>
                </div>
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                theme="light"
            />
        </div>
    );
};

export default Home;