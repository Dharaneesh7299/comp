"use client"

import { useState } from "react"
import { Mail, GraduationCap, MapPin, Edit, Save, X, Award } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

export default function TeacherProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "Dr. Smith",
    email: user?.email || "dr.smith@university.edu",
    institution: "Tech University",
    department: "Computer Science",
    position: "Associate Professor",
    phone: "+1 (555) 987-6543",
    office: "Room 301, CS Building",
    bio: "Experienced educator and researcher in computer science with over 10 years of teaching experience. Passionate about fostering student growth through competitive programming and innovative projects.",
    specializations: ["Machine Learning", "Software Engineering", "Data Structures", "Algorithms"],
    qualifications: [
      "Ph.D. in Computer Science - MIT (2010)",
      "M.S. in Computer Science - Stanford (2006)",
      "B.S. in Computer Science - UC Berkeley (2004)",
    ],
    experience: [
      "Associate Professor - Tech University (2018-Present)",
      "Assistant Professor - State University (2012-2018)",
      "Research Scientist - Tech Corp (2010-2012)",
    ],
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field, value) => {
    const items = value.split("\n").filter((item) => item.trim())
    setFormData((prev) => ({ ...prev, [field]: items }))
  }

  const handleSpecializationsChange = (value) => {
    const specializations = value
      .split(",")
      .map((spec) => spec.trim())
      .filter((spec) => spec)
    setFormData((prev) => ({ ...prev, specializations }))
  }

  const handleSave = () => {
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  const handleCancel = () => {
    setIsEditing(false)
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
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Specializations (comma-separated)</label>
              <input
                type="text"
                value={formData.specializations.join(", ")}
                onChange={(e) => handleSpecializationsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Machine Learning, Software Engineering..."
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
                value={formData.qualifications.join("\n")}
                onChange={(e) => handleArrayChange("qualifications", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ph.D. in Computer Science - MIT (2010)&#10;M.S. in Computer Science - Stanford (2006)..."
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
              value={formData.experience.join("\n")}
              onChange={(e) => handleArrayChange("experience", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Associate Professor - Tech University (2018-Present)&#10;Assistant Professor - State University (2012-2018)..."
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
    </div>
  )
}
