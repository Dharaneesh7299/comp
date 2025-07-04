"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Users, Calendar, MapPin, Trophy, Mail, Phone, User, Crown, Star, Plus, Edit, Trash2 } from "lucide-react"
import { mockData } from "../../lib/mockData"

export default function StudentTeams() {
  const [teams, setTeams] = useState(mockData.userTeams)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    competition: "",
    members: [""],
    description: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMemberChange = (index, value) => {
    const newMembers = [...formData.members]
    newMembers[index] = value
    setFormData((prev) => ({ ...prev, members: newMembers }))
  }

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, ""],
    }))
  }

  const removeMember = (index) => {
    if (formData.members.length > 1) {
      const newMembers = formData.members.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, members: newMembers }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const teamData = {
      ...formData,
      members: formData.members.filter((member) => member.trim()),
    }

    if (editingTeam) {
      // Update existing team
      setTeams((prev) => prev.map((team) => (team.id === editingTeam.id ? { ...team, ...teamData } : team)))
    } else {
      // Create new team
      const newTeam = {
        id: Date.now(),
        ...teamData,
        role: "Team Leader",
        status: "active",
        createdDate: new Date().toISOString().split("T")[0],
      }
      setTeams((prev) => [...prev, newTeam])
    }

    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      competition: "",
      members: [""],
      description: "",
    })
    setShowCreateForm(false)
    setEditingTeam(null)
  }

  const handleEdit = (team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      competition: team.competition,
      members: team.members,
      description: team.description || "",
    })
    setShowCreateForm(true)
  }

  const handleDelete = (teamId) => {
    if (window.confirm("Are you sure you want to leave this team?")) {
      setTeams((prev) => prev.filter((team) => team.id !== teamId))
    }
  }

  const getTeamCompetitionDetails = (teamName) => {
    const registration = mockData.studentRegistrations.find((reg) => reg.teamName === teamName)
    return registration
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      inactive: { bg: "bg-gray-100", text: "text-gray-800", label: "Inactive" },
      completed: { bg: "bg-blue-100", text: "text-blue-800", label: "Completed" },
    }
    const config = statusConfig[status] || statusConfig["active"]
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const isLeader = role === "Team Leader"
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isLeader ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
        }`}
      >
        {isLeader && <Crown className="h-3 w-3 mr-1" />}
        {role}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
          <p className="text-gray-600 mt-1">Manage your competition teams and collaborate with teammates</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Team</span>
        </button>
      </div>

      {/* Create/Edit Team Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingTeam ? "Edit Team" : "Create New Team"}</h2>
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
                  {mockData.competitions.map((comp) => (
                    <option key={comp.id} value={comp.title}>
                      {comp.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Members *</label>
              {formData.members.map((member, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    placeholder={`Member ${index + 1} name`}
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMember}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add Member</span>
              </button>
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
                {editingTeam ? "Update Team" : "Create Team"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => {
          const competitionDetails = getTeamCompetitionDetails(team.name)
          const competition = mockData.competitions.find((comp) => comp.title === team.competition)

          return (
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
                  {getStatusBadge(team.status)}
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
              {competition && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Competition Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {competition.startDate} - {competition.endDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{competition.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Trophy className="h-4 w-4" />
                      <span>{competition.prizePool}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{competition.teamSize} members max</span>
                    </div>
                  </div>

                  {competitionDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Registration Status:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            competitionDetails.status === "won"
                              ? "bg-green-100 text-green-800"
                              : competitionDetails.status === "shortlisted"
                                ? "bg-yellow-100 text-yellow-800"
                                : competitionDetails.status === "registered"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {competitionDetails.status === "won" && <Trophy className="h-3 w-3 mr-1" />}
                          {competitionDetails.status === "shortlisted" && <Star className="h-3 w-3 mr-1" />}
                          {competitionDetails.status.charAt(0).toUpperCase() + competitionDetails.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}
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
                          <p className="font-medium text-gray-900">{member}</p>
                          {index === 0 && team.role === "Team Leader" && (
                            <p className="text-xs text-yellow-600 flex items-center">
                              <Crown className="h-3 w-3 mr-1" />
                              Team Leader
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Send Message"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Call"
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
                    to={`/student/competitions/${competition?.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Competition →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
          <p className="text-gray-600 mb-4">Create your first team to start collaborating with other students</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Your First Team
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {teams.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{teams.length}</p>
              <p className="text-sm text-gray-600">Total Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{teams.filter((t) => t.status === "active").length}</p>
              <p className="text-sm text-gray-600">Active Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {teams.filter((t) => t.role === "Team Leader").length}
              </p>
              <p className="text-sm text-gray-600">Leading</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {teams.reduce((acc, team) => acc + team.members.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
