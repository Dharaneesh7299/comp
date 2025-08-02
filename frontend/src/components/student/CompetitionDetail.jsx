"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, MapPin, Clock, Trophy, Star, CheckCircle, ExternalLink } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

export default function CompetitionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    teamMembers: [""],
    experience: "",
    motivation: "",
  });

  // Fetch competition details
  useEffect(() => {
    const fetchCompetition = async () => {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:4000/api/comp/getcomp", {
          id: Number(id),
        });
        let comp;
        if (response.data.data) {
          // Handle both array and single object responses
          comp = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
          if (!comp) {
            throw new Error("Competition not found");
          }
          const currentDate = new Date();
          const deadlineDate = new Date(comp.deadline);
          const isOpen = currentDate <= deadlineDate;
          console.log(`Competition ${comp.id}: Current Date=${currentDate.toISOString()}, Deadline=${deadlineDate.toISOString()}, Is Registration Open=${isOpen}`);
          setIsRegistrationOpen(isOpen);
          setCompetition({
            id: comp.id,
            title: comp.name,
            description: comp.about,
            category: comp.category,
            startDate: new Date(comp.startdate).toLocaleDateString(),
            endDate: new Date(comp.enddate).toLocaleDateString(),
            registrationDeadline: new Date(comp.deadline).toLocaleDateString(),
            deadlineRaw: comp.deadline,
            location: comp.location,
            teamSize: comp.team_size,
            prizePool: comp.prize_pool,
            priority: comp.priority.toLowerCase(),
            status: isOpen ? comp.status.toLowerCase().replace("_open", "") : "closed",
            url: comp.url,
            requirements: [
              "Must be currently enrolled students",
              `Team of ${comp.team_size} members required`,
              "Basic knowledge of relevant technologies",
            ],
          });
        } else {
          throw new Error("No competition data returned");
        }
      } catch (err) {
        setError("Failed to fetch competition details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompetition();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...formData.teamMembers];
    newMembers[index] = value;
    setFormData((prev) => ({ ...prev, teamMembers: newMembers }));
  };

  const addMember = () => {
    if (formData.teamMembers.length < (competition?.teamSize || 4)) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, ""],
      }));
    }
  };

  const removeMember = (index) => {
    if (formData.teamMembers.length > 1) {
      const newMembers = formData.teamMembers.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, teamMembers: newMembers }));
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      setError("You must be logged in to register");
      return;
    }

    // Validate team members
    const validMembers = formData.teamMembers.filter((reg) => reg.trim());
    if (validMembers.length === 0) {
      setError("At least one team member registration number is required");
      return;
    }

    setIsRegistering(true);
    try {
      const payload = {
        name: formData.teamName,
        competitionId: Number(id),
        motive: formData.motivation,
        experience_level: formData.experience.toUpperCase() || "INTERMEDIATE",
        memberRegisterNumbers: validMembers,
      };

      const response = await axios.post("http://localhost:4000/api/team/create", payload);
      if (response.status === 201 || response.data.team) {
        setShowRegistrationForm(false);
        alert("Registration submitted successfully!");
        setFormData({
          teamName: "",
          teamMembers: [""],
          experience: "",
          motivation: "",
        });
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      setError("Failed to register team: " + (err.response?.data?.message || err.message));
    } finally {
      setIsRegistering(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { bg: "bg-green-100", text: "text-green-800", label: "Ongoing" },
      upcoming: { bg: "bg-blue-100", text: "text-blue-800", label: "Upcoming" },
      registration: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Registration Open" },
      completed: { bg: "bg-gray-100", text: "text-gray-800", label: "Completed" },
      closed: { bg: "bg-red-100", text: "text-red-800", label: "Closed" },
    };
    const config = statusConfig[status] || statusConfig["upcoming"];
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
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
          Back to Competitions
        </Link>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Competition Not Found</h2>
        <Link to="/student/competitions" className="text-blue-600 hover:text-blue-800">
          Back to Competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/student/competitions" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Competitions</span>
        </Link>
      </div>

      {/* Competition Header */}
      <div className="bg-white rounded-lg shadow-md border p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{competition.title}</h1>
              {getStatusBadge(competition.status)}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{competition.category}</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Priority: {competition.priority.toUpperCase()}</span>
              </div>
              {competition.url && (
                <a
                  href={competition.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Official Website
                </a>
              )}
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">{competition.description}</p>
          </div>

          <div className="lg:w-80">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Competition Period</p>
                  <p className="text-sm text-gray-600">
                    {competition.startDate} - {competition.endDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Registration Deadline</p>
                  <p className="text-sm text-gray-600">{competition.registrationDeadline}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{competition.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Team Size</p>
                  <p className="text-sm text-gray-600">{competition.teamSize} members</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Prize Pool</p>
                  <p className="text-sm text-gray-600 font-semibold">{competition.prizePool}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competition Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requirements */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
            <ul className="space-y-2">
              {competition.requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rules */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rules & Guidelines</h2>
            <div className="prose prose-sm text-gray-700">
              <p>All participants must adhere to the following guidelines:</p>
              <ul>
                <li>Original work only - no plagiarism allowed</li>
                <li>Teams must be formed before registration deadline</li>
                <li>All team members must be present during the competition</li>
                <li>Follow the code of conduct and fair play principles</li>
                <li>Submit deliverables within specified time limits</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Registration Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration</h2>

            {!showRegistrationForm ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Ready to participate in this exciting competition?</p>
                  <button
                    onClick={() => setShowRegistrationForm(true)}
                    disabled={!isRegistrationOpen || !user}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isRegistrationOpen && user
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isRegistrationOpen ? (!user ? "Login to Register" : "Register Now") : "Registration Closed"}
                  </button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Registration deadline: {competition.registrationDeadline}
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.teamName}
                    onChange={(e) => handleInputChange("teamName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Members (Registration Numbers) *</label>
                  {formData.teamMembers.map((member, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        placeholder={`Member ${index + 1} registration number (e.g., 21IT0026)`}
                        value={member}
                        onChange={(e) => handleMemberChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.teamMembers.length < competition.teamSize && (
                    <button
                      type="button"
                      onClick={addMember}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Member
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivation</label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => handleInputChange("motivation", e.target.value)}
                    rows={3}
                    placeholder="Why do you want to participate?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRegistrationForm(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering || !isRegistrationOpen}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isRegistering ? "Submitting..." : "Submit Registration"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}