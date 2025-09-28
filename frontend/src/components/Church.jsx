import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Card component
const Card = ({ children, className = "" }) => (
  <div
    className={`md:rounded-2xl shadow-2xl border border-gray-700 bg-white/10 backdrop-blur-lg p-8 ${className}`}
  >
    {children}
  </div>
);

// Button component with loading animation
const Button = ({ children, onClick, type = "button", className = "", loading = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className={`px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold shadow-lg hover:scale-105 hover:opacity-90 transition transform relative ${
      loading ? "opacity-70 cursor-not-allowed" : ""
    } ${className}`}
  >
    {loading && (
      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
    )}
    <span className={loading ? "opacity-50" : ""}>{children}</span>
  </button>
);

// Input component with optional datepicker
const Input = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-yellow-200">{label}</label>
    {type === "date" ? (
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) =>
          onChange({ target: { value: date ? date.toISOString().split("T")[0] : "" } })
        }
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder || "Select date"}
        className="w-full max-w-full px-3 py-2 border border-gray-600 bg-gray-900/70 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition rounded-md"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full max-w-full px-3 py-2 border border-gray-600 bg-gray-900/70 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition rounded-md"
      />
    )}
  </div>
);

// Main form component
const Church = () => {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    parish: "",
    diocese: "",
    dob: "",
    baptism: "",
    confirmation: "",
    marriage: "",
    occupation: "",
    status: "",
    phone: "",
    father: "",
    mother: "",
    rite: "",
    photo: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields (marriage optional)
    const requiredFields = [
      "name",
      "surname",
      "parish",
      "diocese",
      "dob",
      "baptism",
      "confirmation",
      "occupation",
      "status",
      "phone",
      "father",
      "mother",
      "rite",
    ];

    for (const field of requiredFields) {
      if (!form[field]) {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return;
      }
    }

    if (!form.photo) {
      alert("Photo is required");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "photo") data.append(key, value);
      });
      data.append("photo", form.photo);

      const response = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        body: data,
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      console.log("✅ Success:", result);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("Failed to submit form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-800 animate-gradient bg-[length:200%_200%]" />

      {/* Form Card */}
      <Card className="max-w-3xl w-full relative z-10">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 drop-shadow-lg">
            Matter Submission Form
          </h1>
          <div className="flex flex-col items-center">
            <div className="relative w-28 aspect-square rounded-full border-4 border-yellow-500 overflow-hidden shadow-lg">
              {form.photo ? (
                <img
                  src={URL.createObjectURL(form.photo)}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Foto
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Custom button */}
            <label
              htmlFor="photoUpload"
              className="mt-3 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-md cursor-pointer shadow-md transition"
            >
              Add Foto
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input label="Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
          <Input label="Surname" value={form.surname} onChange={(e) => handleChange("surname", e.target.value)} />
          <Input label="Parish" value={form.parish} onChange={(e) => handleChange("parish", e.target.value)} />
          <Input label="Diocese" value={form.diocese} onChange={(e) => handleChange("diocese", e.target.value)} />
          <Input label="Date of Birth" type="date" value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} />
          <Input label="Date of Baptism" type="date" value={form.baptism} onChange={(e) => handleChange("baptism", e.target.value)} />
          <Input label="Date of Confirmation" type="date" value={form.confirmation} onChange={(e) => handleChange("confirmation", e.target.value)} />
          <Input label="Date of Marriage" type="date" value={form.marriage} onChange={(e) => handleChange("marriage", e.target.value)} />
          <Input label="Occupation" value={form.occupation} onChange={(e) => handleChange("occupation", e.target.value)} />
          <Input label="Status" value={form.status} onChange={(e) => handleChange("status", e.target.value)} />
          <Input label="Phone Number" type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          <Input label="Father's Name" value={form.father} onChange={(e) => handleChange("father", e.target.value)} />
          <Input label="Mother's Name" value={form.mother} onChange={(e) => handleChange("mother", e.target.value)} />
          <Input label="Rite" value={form.rite} onChange={(e) => handleChange("rite", e.target.value)} />

          <div className="col-span-1 sm:col-span-2 flex justify-center mt-4">
            <Button type="submit" loading={loading}>
              Submit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Church;
