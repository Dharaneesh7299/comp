
"use client";

import { useState, useEffect } from "react";
import { Mail, GraduationCap, MapPin, Edit, Save, X, Award } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

export default function TeacherProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) {
        console.error("No email found in user object");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:4000/api/teacher/getprofile",
          { email: user.email }
        );

        const data = response.data;

        if (data.message === "Fetched successfully" && data.teacher) {
          setFormData({
            id: data.teacher.id || "",
            name: data.teacher.name || "",
            email: data.teacher.email || "",
            institution: data.teacher.institution || "",
            department: data.teacher.department || "",
            position: data.teacher.position || "",
            phone: data.teacher.phone || "",
            office: data.teacher.office || "",
            bio: data.teacher.bio || "",
            specializations: data.teacher.specialization
              ? data.teacher.specialization.split(",").map((spec) => spec.trim())
              : [],
            qualifications: data.teacher.qualifications
              ? data.teacher.qualifications.split(",").map((qual) => qual.trim())
              : [],
            experience: data.teacher.professional_experience
              ? data.teacher.professional_experience.split(",").map((exp) => exp.trim())
              : [],
          });
        } else {
          console.error("Failed to fetch profile data:", data.message);
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const parseMultilineOrCommaSeparated = (value) => {
    console.log("Parsing input:", value);
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const handleArrayChange = (field, value) => {
    const items = parseMultilineOrCommaSeparated(value);
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  const handleSpecializationsChange = (value) => {
    const specializations = parseMultilineOrCommaSeparated(value);
    setFormData((prev) => ({ ...prev, specializations }));
  };

  const handleKeyDown = (e) => {
    console.log(`Key pressed: ${e.key}, in textarea: ${e.target.name}`);
    if (e.key === "Enter" && !e.shiftKey) {
      // Allow newline unless Shift+Enter (optional customization)
      console.log("Enter key pressed in textarea");
    }
  };

  const handleInput = (e) => {
    console.log(`Input event in ${e.target.name}:`, e.target.value);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.specializations.length || !formData.qualifications.length || !formData.experience.length) {
      alert("Please provide at least one specialization, qualification, and experience.");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:4000/api/teacher/updateteacher",
        {
          id: formData.id,
          name: formData.name,
          email: formData.email,
          institution: formData.institution,
          department: formData.department,
          position: formData.position,
          phone: formData.phone,
          office: formData.office,
          bio: formData.bio,
          specialization: formData.specializations.join(","),
          qualifications: formData.qualifications.join(","),
          professional_experience: formData.experience.join(","),
        }
      );

      if (response.data.message === "Teacher updated successfully") {
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        console.error("Failed to update profile:", response.data.message);
        alert("Failed to update profile: " + response.data.message);
      }
    } catch (err) {
      console.error("Error updating profile:", err.message);
      alert("Error updating profile: " + err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="ml-3 text-gray-700">Loading...</span>
      </div>
    );
  }

  // Render nothing if data is not available
  if (!formData) {
    return <div className="text-center py-10">No profile data available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Form wrapper for editable fields */}
      <form onSubmit={handleSubmit}>
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md border p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-16 w-16 text-green-600" />
              </div>
              {isEditing && (
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Change Photo</button>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {formData.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => handleInputChange("institution", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                      {formData.institution}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone}</p>
                  )}
                </div>
              </div>

              {/* Office */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.office}
                    onChange={(e) => handleInputChange("office", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {formData.office}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                ) : (
                  <p className="text-gray-900">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Specializations */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Specializations</h2>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specializations (one per line)</label>
                <textarea
                  rows={4}
                  name="specializations"
                  value={formData.specializations.join("\n")}
                  onChange={(e) => handleSpecializationsChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ whiteSpace: "pre-wrap" }}
                  placeholder="Machine Learning\nArtificial Intelligence\nData Science..."
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Qualifications</h2>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (one per line)</label>
                <textarea
                  rows={4}
                  name="qualifications"
                  value={formData.qualifications.join("\n")}
                  onChange={(e) => handleArrayChange("qualifications", e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  data-field="qualifications"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ whiteSpace: "pre-wrap" }}
                  placeholder="PhD, Computer Science\nM.Tech, AI..."
                />
              </div>
            ) : (
              <ul className="space-y-2">
                {formData.qualifications.map((qualification, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Award className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{qualification}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Experience</h2>
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (one per line)</label>
              <textarea
                rows={4}
                name="experience"
                value={formData.experience.join("\n")}
                onChange={(e) => handleArrayChange("experience", e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                data-field="experience"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ whiteSpace: "pre-wrap" }}
                placeholder="12 years of teaching and research in CS\nPublished 15+ international papers..."
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {formData.experience.map((exp, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{exp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </div>
  );
}