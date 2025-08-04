"use client";

import { useState, useEffect, Component } from "react";
import axios from "axios";
import { User, Mail, GraduationCap, Hash, Calendar, Edit, Save, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 text-center py-4">
          Something went wrong: {this.state.error?.message || "Unknown error"}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function StudentProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    registrationNo: "",
    year: "",
    major: "",
    phone: "",
    address: "",
    bio: "",
    skills: "",
    achievements: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetched, setIsFetched] = useState(false); // New state to track if profile is fetched

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email || isFetched) return; // Skip if no email or already fetched

      console.log("Loading started");
      setLoading(true);
      try {
        const response = await axios.post("https://comp-kyir.onrender.com/api/student/getprofile", {
          email: user.email,
        });
        console.log("API Response:", response.data);
        if (response.data.student) {
          const studentData = {
            ...response.data.student,
            registrationNo: response.data.student.registerno || "",
            major: response.data.student.department || "",
            address: response.data.student.Address || "",
            bio: response.data.student.bio || "",
            phone: response.data.student.phone || "",
            skills:
              response.data.student.skills === "Provide It" || !response.data.student.skills
                ? ""
                : typeof response.data.student.skills === "string"
                ? response.data.student.skills
                : "",
            achievements:
              response.data.student.Achivements === "Provide It" || !response.data.student.Achivements
                ? ""
                : typeof response.data.student.Achivements === "string"
                ? response.data.student.Achivements
                : "",
          };
          setFormData(studentData);
          setIsFetched(true); // Mark as fetched
        } else {
          setError("Student not found");
        }
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        console.log("Loading ended");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email, isFetched]); // Depend on user.email and isFetched

  const handleInputChange = (field, value) => {
    console.log(`Input change - ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const skills = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "")
        .join(", ");
      const achievements = formData.achievements
        .split(",")
        .map((achievement) => achievement.trim())
        .filter((achievement) => achievement !== "")
        .join(", ");

      const payload = {
        ...formData,
        registerno: formData.registrationNo,
        department: formData.major,
        Address: formData.address,
        skills: skills || "Provide It",
        Achivements: achievements || "Provide It",
      };
      const response = await axios.put("https://comp-kyir.onrender.com/api/student/updateprofile", payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.data.message === "Profile updated successfully") {
        alert("Profile updated successfully!");
        setIsEditing(false);
        setIsFetched(true); // Ensure fetched state remains true after save
      } else {
        setError("Update failed");
      }
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const parseSkillsForDisplay = () => {
    return formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");
  };

  const parseAchievementsForDisplay = () => {
    return formData.achievements
      .split(",")
      .map((achievement) => achievement.trim())
      .filter((achievement) => achievement !== "");
  };

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
  if (error) return <div className="text-red-600 text-center py-4">{error}</div>;

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
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

        <div className="bg-white rounded-lg shadow-md border p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-blue-600" />
              </div>
              {isEditing && (
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Change Photo
                </button>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="off"
                      spellCheck="false"
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
                      autoComplete="off"
                      spellCheck="false"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {formData.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.registrationNo}
                      onChange={(e) => handleInputChange("registrationNo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-mono">{formData.registrationNo}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="first_Year">1st Year</option>
                      <option value="second_Year">2nd Year</option>
                      <option value="third_Year">3rd Year</option>
                      <option value="fourth_Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {formData.year}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => handleInputChange("major", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                      {formData.major}
                    </p>
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
                      autoComplete="off"
                      spellCheck="false"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="off"
                    spellCheck="false"
                  />
                ) : (
                  <p className="text-gray-900">{formData.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="off"
                    spellCheck="false"
                  />
                ) : (
                  <p className="text-gray-900">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="JavaScript, Python, React"
                  autoComplete="off"
                  spellCheck="false"
                />
                <p className="text-sm text-gray-500 mt-1">Separate items with commas (e.g., JavaScript, Python).</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {parseSkillsForDisplay().length > 0 ? (
                  parseSkillsForDisplay().map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {

skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills listed</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievements (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange("achievements", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Winner - Competition Name, Shortlisted - Another Competition"
                  autoComplete="off"
                  spellCheck="false"
                />
                <p className="text-sm text-gray-500 mt-1">Separate items with commas (e.g., Winner - Hackathon, Top 10 - Coding Challenge).</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {parseAchievementsForDisplay().length > 0 ? (
                  parseAchievementsForDisplay().map((achievement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No achievements listed</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}