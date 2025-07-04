"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Trophy, Users, Calendar, TrendingUp, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { mockData } from "../../lib/mockData"

export default function TeacherHome() {
  const [competitions, setCompetitions] = useState(mockData.competitions)

  const stats = [
    { icon: Calendar, label: "Total Competitions", value: competitions.length, color: "text-blue-600" },
    { icon: Users, label: "Total Students", value: mockData.students.length, color: "text-green-600" },
    {
      icon: Trophy,
      label: "Active Competitions",
      value: competitions.filter((c) => c.status === "ongoing" || c.status === "registration").length,
      color: "text-yellow-600",
    },
    {
      icon: TrendingUp,
      label: "Total Registrations",
      value: mockData.studentRegistrations.length,
      color: "text-purple-600",
    },
  ]

  const recentCompetitions = competitions.slice(0, 3)

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

  const getRegistrationStats = (competitionId) => {
    const registrations = mockData.studentRegistrations.filter((r) => r.competitionId === competitionId)
    return {
      total: registrations.length,
      shortlisted: registrations.filter((r) => r.status === "shortlisted").length,
      won: registrations.filter((r) => r.status === "won").length,
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Teacher!</h1>
        <p className="text-green-100">Manage competitions and track student progress</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/teacher/competitions"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Competition</h3>
              <p className="text-gray-600 text-sm">Create a new competition</p>
            </div>
          </div>
        </Link>

        <Link
          to="/teacher/students"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Students</h3>
              <p className="text-gray-600 text-sm">Add and manage students</p>
            </div>
          </div>
        </Link>

        <Link
          to="/teacher/analytics"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Analytics</h3>
              <p className="text-gray-600 text-sm">Competition insights</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Competitions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Competitions</h2>
          <Link to="/teacher/competitions" className="text-blue-600 hover:text-blue-800 font-medium">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {recentCompetitions.map((competition) => {
            const stats = getRegistrationStats(competition.id)
            return (
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

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                      <p className="text-xs text-gray-600">Registered</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{stats.shortlisted}</p>
                      <p className="text-xs text-gray-600">Shortlisted</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.won}</p>
                      <p className="text-xs text-gray-600">Won</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">Deadline: {competition.registrationDeadline}</div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Student Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Student Activity</h2>
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="space-y-4">
              {mockData.studentRegistrations.slice(0, 5).map((registration, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{registration.teamName}</p>
                      <p className="text-sm text-gray-600">{registration.competitionTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(registration.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(registration.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
