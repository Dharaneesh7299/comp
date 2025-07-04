"use client"

import { Calendar, Users, Trophy, MapPin, Medal } from "lucide-react"
import { mockData } from "@/lib/mock-data"

export default function Dashboard({ onViewCompetition }) {
  const { user, registeredCompetitions, userTeams } = mockData

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { bg: "bg-green-100", text: "text-green-800", label: "Ongoing" },
      upcoming: { bg: "bg-blue-100", text: "text-blue-800", label: "Upcoming" },
      completed: { bg: "bg-gray-100", text: "text-gray-800", label: "Completed" },
      registration: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Registration Open" },
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100">Track your competitions and team progress</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-medium">Registered</span>
            </div>
            <p className="text-2xl font-bold mt-1">{registeredCompetitions.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Teams</span>
            </div>
            <p className="text-2xl font-bold mt-1">{userTeams.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Medal className="h-5 w-5" />
              <span className="text-sm font-medium">Achievements</span>
            </div>
            <p className="text-2xl font-bold mt-1">3</p>
          </div>
        </div>
      </div>

      {/* Registered Competitions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Competitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registeredCompetitions.map((competition) => (
            <div
              key={competition.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{competition.title}</h3>
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
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">Registered</span>
                  <button
                    onClick={() => onViewCompetition(competition)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Teams */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600">{team.competition}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{team.role}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Team Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {team.members.map((member, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created: {team.createdDate}</span>
                  <span className={`font-medium ${team.status === "active" ? "text-green-600" : "text-gray-600"}`}>
                    {team.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
