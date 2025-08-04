"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Trophy, Users, Calendar, TrendingUp, Plus, Eye, Edit, Trash2 } from "lucide-react"

export default function TeacherHome() {
  const [competitions, setCompetitions] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    totalStudents: 0,
    activeCompetitions: 0,
    totalRegistrations: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch analytics stats
        const analyticsResponse = await axios.get("https://comp-kyir.onrender.com/api/analytics/count", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
        const analyticsData = analyticsResponse.data.data
        setStats({
          totalCompetitions: analyticsData?.comp_count || 0,
          totalStudents: analyticsData?.std_count || 0,
          activeCompetitions: analyticsData?.act_comp || 0,
          totalRegistrations: analyticsData?.reg_count || 0,
        })

        // Fetch recent competitions with stats
        const recentCompResponse = await axios.get("https://comp-kyir.onrender.com/api/analytics/recent", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
        const recentCompetitions = recentCompResponse.data.data.map((comp) => ({
          id: comp.id,
          title: comp.name,
          category: comp.category,
          status: comp.status.toLowerCase(),
          registrationDeadline: new Date(comp.deadline).toLocaleDateString('en-IN'),
          stats: comp.stats, // Stats included in response (total, shortlisted, won)
        }))
        setCompetitions(recentCompetitions)

        // Fetch recent registrations
        const recentRegResponse = await axios.get("https://comp-kyir.onrender.com/api/analytics/recentreg", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
        const recentRegistrations = recentRegResponse.data.data.map((reg) => ({
          teamName: reg.name,
          competitionTitle: reg.competition.name,
          status: reg.competition.status.toLowerCase(),
          updatedAt: reg.createdAt,
        }))
        setRegistrations(recentRegistrations)
      } catch (err) {
        console.error("Error fetching data:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        })
        setError(err.response?.data?.message || "Failed to load data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const statConfigs = [
    { icon: Calendar, label: "Total Competitions", value: stats.totalCompetitions, color: "text-blue-600" },
    { icon: Users, label: "Total Students", value: stats.totalStudents, color: "text-green-600" },
    { icon: Trophy, label: "Active Competitions", value: stats.activeCompetitions, color: "text-yellow-600" },
    { icon: TrendingUp, label: "Total Registrations", value: stats.totalRegistrations, color: "text-purple-600" },
  ]

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

  return (
    <div className="space-y-8 p-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Teacher!</h1>
        <p className="text-green-100">Manage competitions and track student progress</p>
      </div>

      {/* Loading and Error States */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-3 text-gray-700">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statConfigs.map((stat, index) => {
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
              {competitions.map((competition) => (
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
                        <p className="text-2xl font-bold text-blue-600">{competition.stats?.total || 0}</p>
                        <p className="text-xs text-gray-600">Registered</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{competition.stats?.shortlisted || 0}</p>
                        <p className="text-xs text-gray-600">Shortlisted</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{competition.stats?.won || 0}</p>
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
              ))}
            </div>
          </div>

          {/* Recent Student Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Student Activity</h2>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <div className="space-y-4">
                  {registrations.map((registration, index) => (
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
                          {new Date(registration.updatedAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}