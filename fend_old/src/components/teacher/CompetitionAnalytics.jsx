"use client"

import { useState } from "react"
import { TrendingUp, Users, Trophy, Calendar, Download } from "lucide-react"
import { mockData } from "../../lib/mockData"

export default function CompetitionAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("all")

  // Calculate analytics data
  const totalCompetitions = mockData.competitions.length
  const totalStudents = mockData.students.length
  const totalRegistrations = mockData.studentRegistrations.length
  const activeCompetitions = mockData.competitions.filter(
    (c) => c.status === "ongoing" || c.status === "registration",
  ).length

  // Registration status breakdown
  const statusBreakdown = mockData.studentRegistrations.reduce((acc, reg) => {
    acc[reg.status] = (acc[reg.status] || 0) + 1
    return acc
  }, {})

  // Competition category breakdown
  const categoryBreakdown = mockData.competitions.reduce((acc, comp) => {
    acc[comp.category] = (acc[comp.category] || 0) + 1
    return acc
  }, {})

  // Registration trends (mock data for chart)
  const registrationTrends = [
    { month: "Jan", registrations: 12 },
    { month: "Feb", registrations: 19 },
    { month: "Mar", registrations: 15 },
    { month: "Apr", registrations: 25 },
    { month: "May", registrations: 22 },
    { month: "Jun", registrations: 30 },
  ]

  // Top performing competitions
  const competitionPerformance = mockData.competitions
    .map((comp) => ({
      ...comp,
      registrationCount: mockData.studentRegistrations.filter((r) => r.competitionId === comp.id).length,
    }))
    .sort((a, b) => b.registrationCount - a.registrationCount)
    .slice(0, 5)

  const exportData = () => {
    const data = {
      summary: {
        totalCompetitions,
        totalStudents,
        totalRegistrations,
        activeCompetitions,
      },
      statusBreakdown,
      categoryBreakdown,
      competitionPerformance,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "competition-analytics.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competition Analytics</h1>
          <p className="text-gray-600 mt-1">Insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Competitions</p>
              <p className="text-3xl font-bold text-gray-900">{totalCompetitions}</p>
            </div>
            <Trophy className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+2 this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+5 this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900">{totalRegistrations}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+8 this week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Competitions</p>
              <p className="text-3xl font-bold text-gray-900">{activeCompetitions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-blue-600">Currently running</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Status</h2>
          <div className="space-y-4">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const percentage = ((count / totalRegistrations) * 100).toFixed(1)
              const statusConfig = {
                registered: { color: "bg-blue-500", label: "Registered" },
                shortlisted: { color: "bg-yellow-500", label: "Shortlisted" },
                won: { color: "bg-green-500", label: "Won" },
                rejected: { color: "bg-red-500", label: "Rejected" },
              }
              const config = statusConfig[status] || { color: "bg-gray-500", label: status }

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${config.color}`}></div>
                    <span className="text-gray-700">{config.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Competition Categories */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Competition Categories</h2>
          <div className="space-y-4">
            {Object.entries(categoryBreakdown).map(([category, count]) => {
              const percentage = ((count / totalCompetitions) * 100).toFixed(1)

              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-gray-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Registration Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Trends</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {registrationTrends.map((data, index) => {
            const height = (data.registrations / 30) * 100 // Max height based on highest value
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: "20px" }}
                  title={`${data.registrations} registrations`}
                ></div>
                <span className="text-sm text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs text-gray-500">{data.registrations}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Performing Competitions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Competitions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Competition</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Registrations</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Prize Pool</th>
              </tr>
            </thead>
            <tbody>
              {competitionPerformance.map((competition) => (
                <tr key={competition.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{competition.title}</p>
                      <p className="text-sm text-gray-600">{competition.location}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {competition.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        competition.status === "ongoing"
                          ? "bg-green-100 text-green-800"
                          : competition.status === "registration"
                            ? "bg-yellow-100 text-yellow-800"
                            : competition.status === "upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {competition.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">{competition.registrationCount}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-green-600">{competition.prizePool}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
