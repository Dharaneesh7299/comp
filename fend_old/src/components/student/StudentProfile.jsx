"use client"

import { useState } from "react"
import { User, Mail, GraduationCap, MapPin, Calendar, Edit, Save, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

export default function StudentProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@university.edu",
    institution: "Tech University",
    year: "3rd Year",
    major: "Computer Science",
    phone: "+1 (555) 123-4567",
    address: "123 University Ave, Tech City, TC 12345",
    bio: "Passionate computer science student with interests in AI and web development. Always eager to learn new technologies and participate in challenging competitions.",
    skills: ["JavaScript", "Python", "React", "Node.js", "Machine Learning"],
    achievements: [
      "Winner - Mobile App Development Contest 2024",
      "Shortlisted - AI Innovation Challenge 2024",
      "Dean's List - Fall 2023",
      "Hackathon Participant - 5+ events",
    ],
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSkillsChange = (value) => {
    const skills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill)
    setFormData((prev) => ({ ...prev, skills }))
  }

  const handleAchievementsChange = (value) => {
    const achievements = value.split("\n").filter((achievement) => achievement.trim())
    setFormData((prev) => ({ ...prev, achievements }))
  }

  const handleSave = () => {
    // Here you would typically save to a backend
    setIsEditing(false)
    // Show success message
    alert("Profile updated successfully!")
  }

  const handleCancel = () => {
    // Reset form data to original values
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
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-16 w-16 text-blue-600" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                {isEditing ? (
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
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
                  />
                ) : (
                  <p className="text-gray-900">{formData.major}</p>
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

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  {formData.address}
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

      {/* Skills & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills.join(", ")}
                onChange={(e) => handleSkillsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="JavaScript, Python, React..."
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (one per line)</label>
              <textarea
                rows={6}
                value={formData.achievements.join("\n")}
                onChange={(e) => handleAchievementsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Winner - Competition Name&#10;Shortlisted - Another Competition..."
              />
            </div>
          ) : (
            <ul className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{achievement}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
