// src/components/Church.jsx

import React, { useState, useLayoutEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import gsap from "gsap";

// --- Utility Classes (Tailwind) ---
const inputBaseClasses = "w-full max-w-full px-4 py-2.5 border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition rounded-md shadow-inner text-base";
const labelBaseClasses = "text-sm font-medium text-gray-700";

// --- Corporate Navy & Teal Theme Components ---
const Card = ({ children, className = "", innerRef }) => (
  <div
    ref={innerRef}
    className={`md:rounded-xl shadow-2xl bg-white p-10 border-t-4 border-teal-600 transition-shadow duration-300 ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, type = "button", className = "", loading = false }) => {
  const buttonRef = useRef(null);

  const handleMouseEnter = () => {
    gsap.to(buttonRef.current, { scale: 1.02, duration: 0.2, backgroundColor: "#0f766e" });
  };
  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, { scale: 1, duration: 0.2, backgroundColor: "#0d9488" });
  };
  const handleMouseDown = () => {
    gsap.to(buttonRef.current, { scale: 0.98, duration: 0.1 });
  };
  const handleMouseUp = () => {
    gsap.to(buttonRef.current, { scale: loading ? 1 : 1.02, duration: 0.1 });
  };


  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ backgroundColor: loading ? "#0f766e" : "#0d9488" }}
      className={`px-10 py-3 rounded-lg text-white font-bold tracking-wide shadow-lg relative transition-colors duration-300 ${loading ? "cursor-wait opacity-80" : "hover:shadow-xl"
        } ${className}`}
    >
      {loading && (
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white border-t-transparent rounded-full animate-spin w-5 h-5"></span>
      )}
      <span className={loading ? "opacity-50" : ""}>{children}</span>
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, required = false, isPassword = false, toggleVisibility, isVisible }) => {
  
  const inputType = isPassword ? (isVisible ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      <label className={labelBaseClasses}>
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {type === "date" ? (
        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={(date) =>
            onChange({ target: { value: date ? date.toISOString().split("T")[0] : "" } })
          }
          dateFormat="yyyy-MM-dd"
          placeholderText={placeholder || "Select date"}
          className={inputBaseClasses}
          wrapperClassName="w-full"
          calendarClassName="shadow-xl rounded-lg border border-gray-200"
          portalId="datepicker-portal"
        />
      ) : (
        <div className="relative">
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={inputBaseClasses}
          />
          {isPassword && (
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600 transition duration-150 focus:outline-none"
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.015 10.015 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.59-3.414m2.13-1.87A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.59 3.414m-3.111-3.235a3 3 0 01-3.52-3.52 3.001 3.001 0 01.375.375" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const SelectInput = ({ label, value, onChange, options, required = false, placeholder }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelBaseClasses}>
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`${inputBaseClasses} appearance-none cursor-pointer pr-8 bg-white`}
      >
        <option value="" disabled>{placeholder || `Select ${label}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};


// Main form component
const Church = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'

  const [form, setForm] = useState({
    name: "", surname: "", familyName: "",
    email: "", password: "",
    parishOrigin: "", dioceseOrigin: "",
    parish: "", diocese: "", presentPlace: "",
    dob: "", baptism: "", confirmation: "", marriage: "", occupation: "",
    status: "", phone: "", father: "", mother: "", rite: "", photo: null, role: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const formRef = useRef(null);
  const photoRef = useRef(null);
  const titleRef = useRef(null);

  // Dropdown Options (as previously defined)
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


  // Toggle functions
  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };
  
  const toggleMode = () => {
    // Resetting form fields relevant to sign-up when switching to login
    setForm(prevForm => ({
        email: prevForm.email,
        password: prevForm.password,
        ...Object.fromEntries(
            Object.keys(prevForm).filter(key => key !== 'email' && key !== 'password').map(key => [key, ''])
        )
    }));
    setMode(prevMode => (prevMode === 'signup' ? 'login' : 'signup'));
    setPasswordVisible(false); // Hide password on mode switch
  };


  // GSAP Animation Hook
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(cardRef.current, { clearProps: "all" });

      tl.from(cardRef.current, { opacity: 0, y: 30, duration: 0.5, ease: "power2.out" })
        .from([titleRef.current, photoRef.current], {
          opacity: 0,
          x: -20,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        }, "<0.2");

      if (formRef.current) {
        gsap.from(formRef.current.children, {
          opacity: 0,
          y: 15,
          duration: 0.3,
          stagger: 0.05,
          ease: "power1.out",
        });
      }

    }, cardRef);

    return () => ctx.revert();
  }, [mode]); 

  const handleChange = (field, value) => {
    if (field === "familyName" && mode === 'signup') {
      let formattedValue = value.trim().toUpperCase().replace(/\s/g, '');
      setForm({ ...form, [field]: formattedValue });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let requiredFields = ["email", "password"];
    let submitAction = mode === 'signup' ? "Account Creation" : "Login";

    if (mode === 'signup') {
        requiredFields = [
            ...requiredFields, 
            "name", "surname", "familyName",
            "dob", "baptism", 
            "confirmation", "occupation", "status", "phone", 
            "father", "rite", "role"
        ];
    }
    
    // ... (Validation and Field Mapping logic as previously defined) ...
    const labelMapping = {
      name: "Name", surname: "Surname", familyName: "Family Name", 
      email: "Email", password: "Password",
      dob: "Date of Birth", baptism: "Date of Baptism", confirmation: "Date of Confirmation", 
      occupation: "Occupation", status: "Marital Status", phone: "Phone Number", 
      father: "Father's Name", rite: "Rite", role: "Role in Family"
    };
    
    // --- Validation ---
    for (const field of requiredFields) {
      if (!form[field]) {
        toast.error(`Required field: ${labelMapping[field]} is missing.`);
        return;
      }
    }

    if (mode === 'signup') {
        if (!form.photo) {
          toast.error("Please upload a photograph.");
          return;
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters long for sign up.");
            return;
        }
    }
    // ------------------
    
    // --- API Configuration ---
    const BASE_URL = "https://jinto-backend.vercel.app/api/user";
    const ENDPOINT = `${BASE_URL}/${mode}`; 
    
    // Data preparation
    let requestData;
    let headers = {};

    if (mode === 'login') {
        requestData = {
            email: form.email,
            password: form.password
        };
        headers['Content-Type'] = 'application/json';
    } else {
        requestData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (key !== "photo" && value) {
                requestData.append(key, value);
            }
        });
        if (form.photo) {
            requestData.append("photo", form.photo);
        }
    }
    // -------------------------

    try {
      setLoading(true);

      const response = await fetch(ENDPOINT, {
          method: 'POST',
          body: mode === 'login' ? JSON.stringify(requestData) : requestData,
          headers: headers, 
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.message || `API error: ${response.statusText}`);
      }

      // ** --- DATA STORAGE & REDIRECTION LOGIC --- **
      if (mode === 'login') {
          toast.success("Login successful! Welcome back.");
          
          const userDetails = result.user || result.userData || {}; // Get user object from server response
          
          // 1. Store Token in Local Storage
          if (result.token) {
              localStorage.setItem('userToken', result.token);
          }
          
          // 2. Store User Data (This is the persistence step!)
          // Ensure all necessary fields (e.g., name, email, etc.) are included in userDetails
          localStorage.setItem('userData', JSON.stringify(userDetails));

          // 3. Trigger Redirection to Home component
          if (onAuthSuccess) {
              onAuthSuccess(userDetails, result.token); 
          }
          
      } else { // Signup success
          toast.success("Account created successfully! Please log in.");
          // Auto-switch to login mode after successful signup
          setMode('login'); 
      }
      // ** ----------------------------------------- **
      
      // Reset password/photo
      setForm(prevForm => ({
        ...prevForm,
        password: "",
        ...(mode === 'signup' ? { photo: null } : {})
      }));

    } catch (error) {
      console.error(`❌ ${submitAction} error:`, error.message);
      toast.error(`${submitAction} failed. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const isSignUpMode = mode === 'signup';
  const headerTitle = isSignUpMode ? "Official Account Creation & Enrollment" : "Member Login";
  const headerSubtitle = isSignUpMode ? "Create your user account and complete your official enrollment." : "Enter your registered credentials to access your account.";


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans">
      <Card innerRef={cardRef} className={`max-w-4xl w-full ${isSignUpMode ? '' : 'max-w-md'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 border-b border-gray-200 pb-6">
          <div ref={titleRef}>
            <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">
              {headerTitle}
            </h1>
            <p className="text-lg text-gray-500 mt-1">
              {headerSubtitle}
            </p>
          </div>

          {isSignUpMode && (
              <div ref={photoRef} className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-32 h-32 rounded-full border-4 border-teal-600 overflow-hidden shadow-lg bg-gray-100">
                  {form.photo ? (
                    <img
                      src={URL.createObjectURL(form.photo)}
                      alt="Applicant Photo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm p-2 text-center border border-dashed border-gray-400/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Photo
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photoUpload"
                  className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-md cursor-pointer shadow-md transition-colors duration-300"
                >
                  {form.photo ? "Change Photo" : "Upload Photo"}
                </label>
              </div>
          )}
        </div>

        <form 
            ref={formRef} 
            onSubmit={handleSubmit} 
            className={`grid gap-6 ${isSignUpMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
        >
          {/* --- ACCOUNT DETAILS (ALWAYS VISIBLE) --- */}
          <h2 className={`text-xl font-bold text-teal-700 mt-4 border-b border-teal-100 pb-2 ${isSignUpMode ? 'lg:col-span-3 sm:col-span-2' : 'col-span-1'}`}>
            {isSignUpMode ? 'Account Credentials' : 'Login Credentials'}
          </h2>
          
          <Input 
            label="Email" 
            type="email" 
            value={form.email} 
            required={true} 
            onChange={(e) => handleChange("email", e.target.value)} 
            placeholder="e.g., john.doe@example.com" 
          />
          
          <Input 
            label="Password" 
            type="password" 
            value={form.password} 
            required={true} 
            onChange={(e) => handleChange("password", e.target.value)} 
            placeholder={isSignUpMode ? "Minimum 6 characters" : "Your Password"}
            isPassword={true}
            toggleVisibility={togglePasswordVisibility}
            isVisible={passwordVisible}
          />

          {!isSignUpMode && <div className="hidden lg:block"></div>}
          
          {/* --- SIGNUP FIELDS (CONDITIONAL) --- */}
          {isSignUpMode && (
            <>
                {/* Spacer */}
                <div className="hidden lg:block"></div> 

                {/* PERSONAL DETAILS */}
                <h2 className="lg:col-span-3 sm:col-span-2 text-xl font-bold text-teal-700 mt-4 border-b border-teal-100 pb-2">Personal Details</h2>
                
                <Input label="Name" value={form.name} required={true} onChange={(e) => handleChange("name", e.target.value)} placeholder="First Name" />
                <Input label="Surname" value={form.surname} required={true} onChange={(e) => handleChange("surname", e.target.value)} placeholder="Last Name" />
                <Input label="Date of Birth" type="date" placeholder='YYYY-MM-DD' value={form.dob} required={true} onChange={(e) => handleChange("dob", e.target.value)} />

                {/* Address/Affiliation Details */}
                <h2 className="lg:col-span-3 sm:col-span-2 text-xl font-bold text-teal-700 mt-4 border-b border-teal-100 pb-2">Origin & Current Location</h2>

                <Input label="Parish of Origin (Optional)" value={form.parishOrigin} required={false} onChange={(e) => handleChange("parishOrigin", e.target.value)} placeholder="Parish of Baptism/Birth" />
                <Input label="Diocese of Origin (Optional)" value={form.dioceseOrigin} required={false} onChange={(e) => handleChange("dioceseOrigin", e.target.value)} placeholder="Diocese of Baptism/Birth" />
                
                <Input label="Family Name" value={form.familyName} required={true} onChange={(e) => handleChange("familyName", e.target.value)} placeholder="Family Name (e.g., MANNAL)" /> 
                
                <Input label="Present Place (Optional)" value={form.presentPlace} required={false} onChange={(e) => handleChange("presentPlace", e.target.value)} placeholder="Village/Town/City" />
                <Input label="Present Parish (Optional)" value={form.parish} required={false} onChange={(e) => handleChange("parish", e.target.value)} placeholder="Current Parish" />
                <Input label="Present Diocese (Optional)" value={form.diocese} required={false} onChange={(e) => handleChange("diocese", e.target.value)} placeholder="Current Diocese" />
                
                <Input label="Occupation" value={form.occupation} required={true} onChange={(e) => handleChange("occupation", e.target.value)} placeholder="Current Employment/Field" />
                
                <SelectInput
                  label="Rite"
                  value={form.rite}
                  onChange={(e) => handleChange("rite", e.target.value)}
                  options={riteOptions}
                  required={true}
                  placeholder="Select Liturgical Rite"
                />

                {/* Sacramental Details */}
                <h2 className="lg:col-span-3 sm:col-span-2 text-xl font-bold text-teal-700 mt-4 border-b border-teal-100 pb-2">Sacramental Status</h2>
                <Input label="Date of Baptism" placeholder='YYYY-MM-DD' type="date" value={form.baptism} required={true} onChange={(e) => handleChange("baptism", e.target.value)} />
                <Input label="Date of Confirmation" placeholder='YYYY-MM-DD' type="date" value={form.confirmation} required={true} onChange={(e) => handleChange("confirmation", e.target.value)} />
                <Input label="Date of Marriage (Optional)" placeholder='YYYY-MM-DD' type="date" value={form.marriage} required={false} onChange={(e) => handleChange("marriage", e.target.value)} />

                {/* Contact & Status */}
                <h2 className="lg:col-span-3 sm:col-span-2 text-xl font-bold text-teal-700 mt-4 border-b border-teal-100 pb-2">Contact & Family Role</h2>

                <SelectInput
                  label="Marital Status"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  options={statusOptions}
                  required={true}
                  placeholder="Select Status"
                />

                <Input label="Phone Number" type="tel" value={form.phone} required={true} onChange={(e) => handleChange("phone", e.target.value)} placeholder="(+XX) XXXXX XXXXX" />

                <Input label="Father's Name" value={form.father} required={true} onChange={(e) => handleChange("father", e.target.value)} placeholder="Father's Full Legal Name" />

                <SelectInput
                  label="Role in Family"
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  options={roleOptions}
                  required={true}
                  placeholder="Select Role"
                />

                <Input label="Mother's Name (Optional)" value={form.mother} required={false} onChange={(e) => handleChange("mother", e.target.value)} placeholder="Mother's Full Legal Name" />
            </>
          )}


          <div className={`col-span-1 flex justify-between items-center mt-8 ${isSignUpMode ? 'lg:col-span-3 sm:col-span-2 flex-col gap-4' : 'flex-col'}`}>
            <Button type="submit" loading={loading} className="min-w-[250px] text-lg ">
              {loading 
                ? (isSignUpMode ? "Creating Account..." : "Logging In...") 
                : (isSignUpMode ? "Create Account & Submit Enrollment" : "Login to Account")
              }
            </Button>
            
            <p className={`text-sm  text-gray-600 ${isSignUpMode?"":"mt-4"} `}>
                {isSignUpMode ? "Already have an account?" : "Don't have an account?"}
                <button 
                    type="button" 
                    onClick={toggleMode}
                    className="ml-2 font-semibold text-teal-600 hover:text-teal-800 transition duration-150 focus:outline-none"
                >
                    {isSignUpMode ? "Login" : "Sign Up"}
                </button>
            </p>
          </div>
        </form>
      </Card>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        theme="light"
      />

      <div id="datepicker-portal" />
    </div>
  );
};

export default Church;