"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Trophy } from "lucide-react"
import { mockData } from "../../lib/mockData"

export default function ManageCompetitions() {
  const [competitions, setCompetitions] = useState(mockData.competitions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "registration",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    location: "",
    teamSize: 1,
    prizePool: "",
    priority: "medium",
  })

  const filteredCompetitions = competitions.filter((competition) => {
    const matchesSearch =
      competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || competition.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingCompetition) {
      // Update existing competition
      setCompetitions((prev) =>
        prev.map((comp) => (comp.id === editingCompetition.id ? { ...comp, ...formData } : comp)),
      )
    } else {
      // Add new competition
      const newCompetition = {
        id: Date.now(),
        ...formData,
        teamSize: Number.parseInt(formData.teamSize),
      }
      setCompetitions((prev) => [...prev, newCompetition])
    }

    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      status: "registration",
      startDate: "",
      endDate: "",
      registrationDeadline: "",
      location: "",
      teamSize: 1,
      prizePool: "",
      priority: "medium",
    })
    setShowAddForm(false)
    setEditingCompetition(null)
  }

  const handleEdit = (competition) => {
    setEditingCompetition(competition)
    setFormData({
      title: competition.title,
      description: competition.description,
      category: competition.category,
      status: competition.status,
      startDate: competition.startDate,
      endDate: competition.endDate,
      registrationDeadline: competition.registrationDeadline,
      location: competition.location,
      teamSize: competition.teamSize,
      prizePool: competition.prizePool,
      priority: competition.priority,
    })
    setShowAddForm(true)
  }

  const handleDelete = (competitionId) => {
    if (window.confirm("Are you sure you want to delete this competition?")) {
      setCompetitions((prev) => prev.filter((comp) => comp.id !== competitionId))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { bg: "bg-green-100", text: "text-green-800", label: "Ongoing" },
      upcoming: { bg: "bg-blue-100", text: "text-blue-800", label: "Upcoming" },
      registration: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Registration Open" },
      completed: { bg: "bg-gray-100", text: "text-gray-800", label: "Completed" },
    }
    const config = statusConfig[status] || statusConfig["upcoming"]
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  const getRegistrationCount = (competitionId) => {
    return mockData.studentRegistrations.filter((r) => r.competitionId === competitionId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Competitions</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage competitions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Competition</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search competitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="registration">Registration Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingCompetition ? "Edit Competition" : "Add New Competition"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Competition Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="registration">Registration Open</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline *</label>
                <input
                  type="date"
                  required
                  value={formData.registrationDeadline}
                  onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Size *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange("teamSize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool *</label>
                <input
                  type="text"
                  required
                  value={formData.prizePool}
                  onChange={(e) => handleInputChange("prizePool", e.target.value)}
                  placeholder="e.g., $10,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
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
                {editingCompetition ? "Update Competition" : "Add Competition"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Competitions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompetitions.map((competition) => (
          <div key={competition.id} className="bg-white rounded-lg shadow-md border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{competition.title}</h3>
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-2">
                  {competition.category}
                </span>
              </div>
              {getStatusBadge(competition.status)}
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {competition.startDate} - {competition.endDate}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{competition.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{competition.teamSize} members per team</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>{competition.prizePool}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">{getRegistrationCount(competition.id)} registrations</div>
              <div className="flex space-x-2">
                <button className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(competition)}
                  className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                  title="Edit Competition"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(competition.id)}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete Competition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompetitions.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Add your first competition to get started"}
          </p>
        </div>
      )}
    </div>
  )
}
