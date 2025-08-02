"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, MapPin, Trophy, Mail, Phone, User, Crown, Star, Edit, Trash2, Clipboard } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    competition: "",
    members: [""],
    description: "",
  });
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    leadingTeams: 0,
    totalMembers: 0,
  });
  const [isFetched, setIsFetched] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState({});
  const [copiedPhone, setCopiedPhone] = useState({});

  // Fetch studentId, teams, and stats
  useEffect(() => {
    if (!user?.email || isFetched) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch student profile to get correct studentId
        const profileResponse = await axios.post("http://localhost:4000/api/student/getprofile", {
          email: user.email,
        });
        if (!profileResponse.data.student) {
          throw new Error("Student profile not found");
        }
        const fetchedStudentId = profileResponse.data.student.id;
        setStudentId(fetchedStudentId);

        // Fetch teams with competition and member details
        const teamsResponse = await axios.post("http://localhost:4000/api/team/get", {
          studentId: fetchedStudentId,
        });
        const fetchedTeams = teamsResponse.data.teams.map((team) => ({
          id: team.id,
          name: team.name,
          competition: team.competition.name,
          competitionId: team.competitionId,
          members: team.members.map((m) => ({
            registerno: m.student.registerno,
            email: m.student.email || null,
            phone: m.student.phone || null,
          })),
          role: team.members.find((m) => m.studentId === fetchedStudentId)?.role || "DEVELOPER",
          status: team.status.toLowerCase(),
          del_status: team.del_status,
          createdDate: new Date(team.createdAt).toISOString().split("T")[0],
          description: team.motive,
          competitionDetails: {
            id: team.competition.id,
            title: team.competition.name,
            startDate: new Date(team.competition.startdate).toLocaleDateString(),
            endDate: new Date(team.competition.enddate).toLocaleDateString(),
            location: team.competition.location,
            prizePool: team.competition.prize_pool,
            teamSize: team.competition.team_size,
          },
        }));
        setTeams(fetchedTeams);

        // Extract unique competitions for dropdown
        const uniqueCompetitions = Array.from(
          new Map(
            teamsResponse.data.teams.map((team) => [
              team.competition.id,
              { id: team.competition.id, title: team.competition.name },
            ]),
          ).values(),
        );
        setCompetitions(uniqueCompetitions);

        // Fetch team statistics
        const statsResponse = await axios.post("http://localhost:4000/api/team/std_data", {
          id: fetchedStudentId,
        });
        setStats({
          totalTeams: statsResponse.data.data.t_count,
          activeTeams: statsResponse.data.data.active_teams,
          leadingTeams: statsResponse.data.data.lead_teams,
          totalMembers: statsResponse.data.data.mem_count,
        });

        setIsFetched(true);
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email, isFetched]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId) {
      setError("Student ID not available");
      return;
    }

    const payload = {
      id: editingTeam.id,
      name: formData.name,
      competitionId: Number(formData.competition),
      motive: formData.description,
      experience_level: "INTERMEDIATE",
      memberRegisterNumbers: formData.members.filter((reg) => reg.trim()),
    };

    try {
      // Update team
      const response = await axios.put("http://localhost:4000/api/team/update", payload);
      setTeams((prev) =>
        prev.map((team) =>
          team.id === editingTeam.id
            ? {
                ...team,
                name: response.data.team.name,
                competition: competitions.find((c) => c.id === Number(formData.competition))?.title || team.competition,
                competitionId: response.data.team.competitionId,
                members: response.data.team.members.map((m) => ({
                  registerno: m.student.registerno,
                  email: m.student.email || null,
                  phone: m.student.phone || null,
                })),
                description: response.data.team.motive,
                status: response.data.team.status.toLowerCase(),
                del_status: response.data.team.del_status,
                competitionDetails: {
                  id: response.data.team.competition.id,
                  title: response.data.team.competition.name,
                  startDate: new Date(response.data.team.competition.startdate).toLocaleDateString(),
                  endDate: new Date(response.data.team.competition.enddate).toLocaleDateString(),
                  location: response.data.team.competition.location,
                  prizePool: response.data.team.competition.prize_pool,
                  teamSize: response.data.team.competition.team_size,
                },
              }
            : team,
        ),
      );

      // Update stats
      const statsResponse = await axios.post("http://localhost:4000/api/team/std_data", {
        id: studentId,
      });
      setStats({
        totalTeams: statsResponse.data.data.t_count,
        activeTeams: statsResponse.data.data.active_teams,
        leadingTeams: statsResponse.data.data.lead_teams,
        totalMembers: statsResponse.data.data.mem_count,
      });

      resetForm();
    } catch (err) {
      setError("Failed to update team: " + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      competition: "",
      members: [""],
      description: "",
    });
    setEditingTeam(null);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      competition: team.competitionId,
      members: team.members.map((m) => m.registerno),
      description: team.description || "",
    });
  };

  const handleDelete = async (teamId) => {
    if (!studentId) {
      setError("Student ID not available");
      return;
    }

    if (window.confirm("Are you sure you want to leave this team?")) {
      try {
        await axios.delete("http://localhost:4000/api/team/delete", {
          data: { id: teamId },
        });
        setTeams((prev) => prev.filter((team) => team.id !== teamId));
        // Update stats
        const statsResponse = await axios.post("http://localhost:4000/api/team/std_data", {
          id: studentId,
        });
        setStats({
          totalTeams: statsResponse.data.data.t_count,
          activeTeams: statsResponse.data.data.active_teams,
          leadingTeams: statsResponse.data.data.lead_teams,
          totalMembers: statsResponse.data.data.mem_count,
        });
      } catch (err) {
        setError("Failed to delete team: " + err.message);
      }
    }
  };

  const handleTogglePhone = (teamId, memberIndex) => {
    setShowPhoneNumber((prev) => ({
      ...prev,
      [`${teamId}-${memberIndex}`]: !prev[`${teamId}-${memberIndex}`],
    }));
    setCopiedPhone((prev) => ({ ...prev, [`${teamId}-${memberIndex}`]: false }));
  };

  const handleCopyPhone = (phone, teamId, memberIndex) => {
    if (phone && phone !== "Provide It") {
      navigator.clipboard.writeText(phone);
      setCopiedPhone((prev) => ({ ...prev, [`${teamId}-${memberIndex}`]: true }));
      setTimeout(() => {
        setCopiedPhone((prev) => ({ ...prev, [`${teamId}-${memberIndex}`]: false }));
      }, 2000);
    }
  };

  const getStatusBadge = (del_status) => {
    const statusConfig = {
      ONLINE: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      OFFLINE: { bg: "bg-gray-100", text: "text-gray-800", label: "Inactive" },
    };
    const config = statusConfig[del_status] || statusConfig["ONLINE"];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRegistrationStatusBadge = (status) => {
    const statusConfig = {
      registered: { bg: "bg-blue-100", text: "text-blue-800", label: "Registered" },
      shortlisted: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Shortlisted" },
      won: { bg: "bg-green-100", text: "text-green-800", label: "Won" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig["registered"];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status === "won" && <Trophy className="h-3 w-3 mr-1" />}
        {status === "shortlisted" && <Star className="h-3 w-3 mr-1" />}
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const isLeader = role === "LEADER";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isLeader ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
        }`}
      >
        {isLeader && <Crown className="h-3 w-3 mr-1" />}
        {isLeader ? "Team Leader" : "Developer"}
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
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
          <p className="text-gray-600 mt-1">Manage your competition teams and collaborate with teammates</p>
        </div>
      </div>

      {/* Edit Team Form */}
      {editingTeam && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Team</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competition *</label>
                <select
                  required
                  value={formData.competition}
                  onChange={(e) => handleInputChange("competition", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Competition</option>
                  {competitions.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Members (Registration Numbers) *</label>
              {formData.members.map((member, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    required
                    placeholder={`Registration Number ${index + 1}`}
                    value={member}
                    onChange={(e) => handleInputChange("members", [
                      ...formData.members.slice(0, index),
                      e.target.value,
                      ...formData.members.slice(index + 1),
                    ])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your team..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Update Team
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-lg shadow-md border p-6">
            {/* Team Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                  {getRoleBadge(team.role)}
                </div>
                <p className="text-gray-600 font-medium">{team.competition}</p>
                {team.description && <p className="text-sm text-gray-500 mt-1">{team.description}</p>}
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(team.del_status)}
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Team"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Leave Team"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Competition Details */}
            {team.competitionDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Competition Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {team.competitionDetails.startDate} - {team.competitionDetails.endDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{team.competitionDetails.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Trophy className="h-4 w-4" />
                    <span>{team.competitionDetails.prizePool}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{team.competitionDetails.teamSize} members max</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Registration Status:</span>
                    {getRegistrationStatusBadge(team.status)}
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Team Members ({team.members.length})</h4>
              <div className="space-y-2">
                {team.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.registerno}</p>
                        <p className="text-xs text-gray-600">{member.email || "Not found"}</p>
                        {showPhoneNumber[`${team.id}-${index}`] && (
                          <p className="text-xs text-gray-600">
                            {member.phone || "Not found"}
                            {member.phone && member.phone !== "Provide It" && (
                              <button
                                onClick={() => handleCopyPhone(member.phone, team.id, index)}
                                className="ml-2 p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Copy Phone Number"
                              >
                                {copiedPhone[`${team.id}-${index}`] ? (
                                  <span className="text-xs text-green-600">Copied!</span>
                                ) : (
                                  <Clipboard className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {member.phone === "Provide It" && (
                              <span className="ml-2 text-xs text-red-600">Invalid</span>
                            )}
                          </p>
                        )}
                        {index === 0 && team.role === "LEADER" && (
                          <p className="text-xs text-yellow-600 flex items-center">
                            <Crown className="h-3 w-3 mr-1" />
                            Team Leader
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={member.email ? `mailto:${member.email}?subject=Team Collaboration` : "#"}
                        className={`p-1 ${member.email ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50" : "text-gray-400 cursor-not-allowed"} rounded`}
                        title={member.email ? "Send Email" : "Email Not Available"}
                        onClick={(e) => !member.email && e.preventDefault()}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleTogglePhone(team.id, index)}
                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Show/Hide Phone Number"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Created: {team.createdDate}</span>
                <Link
                  to={`/student/competitions/${team.competitionId}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Competition →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
          <p className="text-gray-600 mb-4">You are not part of any teams yet.</p>
        </div>
      )}

      {/* Quick Stats */}
      {teams.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalTeams}</p>
              <p className="text-sm text-gray-600">Total Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.activeTeams}</p>
              <p className="text-sm text-gray-600">Active Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.leadingTeams}</p>
              <p className="text-sm text-gray-600">Leading</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.totalMembers}</p>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}