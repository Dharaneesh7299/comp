"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Users, Medal, Calendar, MapPin, Upload, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentHome() {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState([
    { icon: Trophy, label: "Registered", value: 0, color: "text-blue-600" },
    { icon: CheckCircle, label: "Shortlisted", value: 0, color: "text-green-600" },
    { icon: Medal, label: "Won", value: 0, color: "text-yellow-600" },
    { icon: Users, label: "Teams", value: 0, color: "text-purple-600" },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student profile and dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.email) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch student profile to get studentId
        const profileResponse = await axios.post("https://comp-kyir.onrender.com/api/student/getprofile", {
          email: user.email,
        });
        if (!profileResponse.data.student) {
          throw new Error("Student profile not found");
        }
        const fetchedStudentId = profileResponse.data.student.id;
        setStudentId(fetchedStudentId);

        // Fetch stats
        const statsResponse = await axios.post("https://comp-kyir.onrender.com/api/team/dash_data", {
          id: fetchedStudentId,
        });
        if (statsResponse.data.data) {
          setStats([
            { icon: Trophy, label: "Registered", value: statsResponse.data.data.reg_count, color: "text-blue-600" },
            { icon: CheckCircle, label: "Shortlisted", value: statsResponse.data.data.short_count, color: "text-green-600" },
            { icon: Medal, label: "Won", value: statsResponse.data.data.won_count, color: "text-yellow-600" },
            { icon: Users, label: "Teams", value: statsResponse.data.data.active_teams, color: "text-purple-600" },
          ]);
        }

        // Fetch registrations
        const teamsResponse = await axios.post("https://comp-kyir.onrender.com/api/team/get", {
          studentId: fetchedStudentId,
        });
        if (teamsResponse.data.teams) {
          const mappedRegistrations = teamsResponse.data.teams.map((team) => ({
            id: team.id,
            competitionTitle: team.competition.name,
            teamName: team.name,
            teamMembers: team.members.map((member) => member.student.name),
            registrationDate: new Date(team.createdAt).toLocaleDateString(),
            location: team.competition.location,
            status: team.status.toLowerCase(),
            updatedAt: team.createdAt, // Use createdAt until updatedAt is provided
            proofDocument: team.certifacte || null, // Use certifacte if available
          }));
          setRegistrations(mappedRegistrations);
        }
      } catch (err) {
        setError("Failed to fetch dashboard data: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleFileUpload = async (registrationId, file) => {
    if (!file) {
      setError("No file selected for upload");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploadingFor(registrationId);

    try {
      const formData = new FormData();
      formData.append("id", registrationId);
      formData.append("certificate", file);

      const uploadResponse = await axios.post("https://comp-kyir.onrender.com/api/team/upload_cert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadResponse.data.url) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === registrationId
              ? { ...reg, proofDocument: uploadResponse.data.url, updatedAt: new Date().toISOString() }
              : reg,
          ),
        );
      }
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploadingFor(null);
      setSelectedFile(null);
    }
  };

  const handleStatusUpdate = async (registrationId, newStatus) => {
    const upperCaseStatus = newStatus.toUpperCase();

    // For SHORTLISTED, require proofDocument or new upload
    if (upperCaseStatus === "SHORTLISTED") {
      const updatedReg = registrations.find((reg) => reg.id === registrationId);
      if (!updatedReg?.proofDocument) {
        if (!selectedFile) {
          setError("Please select a file to upload before marking as shortlisted");
          setTimeout(() => setError(null), 3000);
          return;
        }
        await handleFileUpload(registrationId, selectedFile);
        const refreshedReg = registrations.find((reg) => reg.id === registrationId);
        if (!refreshedReg?.proofDocument) {
          setError("File upload failed, status not updated");
          setTimeout(() => setError(null), 3000);
          return;
        }
      }
    }

    // For WON, always require a new file upload
    if (upperCaseStatus === "WON") {
      if (!selectedFile) {
        setError("Please select a file to upload before marking as won");
        setTimeout(() => setError(null), 3000);
        return;
      }
      await handleFileUpload(registrationId, selectedFile);
      const refreshedReg = registrations.find((reg) => reg.id === registrationId);
      if (!refreshedReg?.proofDocument) {
        setError("File upload failed, status not updated");
        setTimeout(() => setError(null), 3000);
        return;
      }
    }

    try {
      const statusResponse = await axios.put("https://comp-kyir.onrender.com/api/team/update-status", {
        teamId: registrationId,
        status: upperCaseStatus,
      });

      if (statusResponse.data.team) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === registrationId
              ? { ...reg, status: statusResponse.data.team.status.toLowerCase(), updatedAt: new Date().toISOString() }
              : reg,
          ),
        );
        // Reload page for SHORTLISTED or WON
        if (["SHORTLISTED", "WON"].includes(upperCaseStatus)) {
          window.location.reload();
        }
      }
    } catch (err) {
      setError("Status update failed: " + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      registered: { bg: "bg-blue-100", text: "text-blue-800", label: "Registered" },
      shortlisted: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Shortlisted" },
      won: { bg: "bg-green-100", text: "text-green-800", label: "Won" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig["registered"];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
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
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
        <Link to="/student/competitions" className="text-blue-600 hover:text-blue-800">
          Browse Competitions
        </Link>
      </div>
    );
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
          const Icon = stat.icon;
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
          );
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

                {/* Status Update Section for Registered */}
                {registration.status === "registered" && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Upload Proof Document:</p>
                      {registration.proofDocument && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
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
                      <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(registration.id, "shortlisted")}
                          disabled={!registration.proofDocument || uploadingFor === registration.id}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          Uploaded
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
                        disabled={!selectedFile || uploadingFor === registration.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Rejected Status */}
                {registration.status === "rejected" && (
                  <div className="border-t pt-4">
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Sorry, you are rejected</span>
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
  );
}