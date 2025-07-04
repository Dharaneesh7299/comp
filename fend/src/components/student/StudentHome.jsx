"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Trophy, Users, Medal, Calendar, MapPin, Upload, CheckCircle } from "lucide-react"
import { mockData } from "../../lib/mockData"

export default function StudentHome() {
  const [registrations, setRegistrations] = useState(mockData.studentRegistrations)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingFor, setUploadingFor] = useState(null)

  const stats = [
    { icon: Trophy, label: "Registered", value: registrations.length, color: "text-blue-600" },
    {
      icon: CheckCircle,
      label: "Shortlisted",
      value: registrations.filter((r) => r.status === "shortlisted").length,
      color: "text-green-600",
    },
    {
      icon: Medal,
      label: "Won",
      value: registrations.filter((r) => r.status === "won").length,
      color: "text-yellow-600",
    },
    { icon: Users, label: "Teams", value: mockData.userTeams.length, color: "text-purple-600" },
  ]

  const handleStatusUpdate = (registrationId, newStatus) => {
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === registrationId ? { ...reg, status: newStatus, updatedAt: new Date().toISOString() } : reg,
      ),
    )
  }

  const handleFileUpload = (registrationId, file) => {
    if (!file) return

    setUploadingFor(registrationId)

    // Simulate file upload
    setTimeout(() => {
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, proofDocument: file.name, updatedAt: new Date().toISOString() } : reg,
        ),
      )
      setUploadingFor(null)
      setSelectedFile(null)
    }, 2000)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      registered: { bg: "bg-blue-100", text: "text-blue-800", label: "Registered" },
      shortlisted: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Shortlisted" },
      won: { bg: "bg-green-100", text: "text-green-800", label: "Won" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Not Selected" },
    }
    const config = statusConfig[status] || statusConfig["registered"]
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
        <p className="text-blue-100">Track your competition progress and achievements</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* My Registrations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Registrations</h2>
          <Link
            to="/student/competitions"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Competitions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {registrations.map((registration) => (
            <div key={registration.id} className="bg-white rounded-lg shadow-md border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{registration.competitionTitle}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{registration.registrationDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{registration.location}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(registration.status)}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Team: {registration.teamName}</p>
                  <div className="flex flex-wrap gap-2">
                    {registration.teamMembers.map((member, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Update Section */}
                {registration.status === "registered" && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(registration.id, "shortlisted")}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Mark Shortlisted
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(registration.id, "rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Mark Rejected
                      </button>
                    </div>
                  </div>
                )}

                {/* File Upload for Shortlisted */}
                {registration.status === "shortlisted" && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Upload Proof Document:</p>
                      {registration.proofDocument && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {registration.proofDocument}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                      />
                      <button
                        onClick={() => handleFileUpload(registration.id, selectedFile)}
                        disabled={!selectedFile || uploadingFor === registration.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {uploadingFor === registration.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-2">
                      <button
                        onClick={() => handleStatusUpdate(registration.id, "won")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Mark as Won
                      </button>
                    </div>
                  </div>
                )}

                {/* Won Status */}
                {registration.status === "won" && (
                  <div className="border-t pt-4">
                    <div className="flex items-center text-green-600">
                      <Medal className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Congratulations! You won this competition!</span>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Last updated: {new Date(registration.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {registrations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Registrations Yet</h3>
            <p className="text-gray-600 mb-4">Start by registering for your first competition</p>
            <Link
              to="/student/competitions"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Browse Competitions
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
