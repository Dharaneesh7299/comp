"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, MapPin, Clock, Trophy, Filter, Search } from "lucide-react";
import axios from "axios";

export default function StudentCompetitions() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch competitions
  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      try {
        const response = await axios.get("https://comp-backend.onrender.com/api/comp/get");
        if (response.data.g_comp) {
          // Normalize the data to match the component's expected structure
          const normalizedCompetitions = response.data.g_comp.map((comp) => ({
            id: comp.id,
            title: comp.name,
            description: comp.about,
            category: comp.category,
            startDate: new Date(comp.startdate).toLocaleDateString(),
            endDate: new Date(comp.enddate).toLocaleDateString(),
            registrationDeadline: new Date(comp.deadline).toLocaleDateString(),
            location: comp.location,
            teamSize: comp.team_size,
            prizePool: comp.prize_pool,
            priority: comp.priority.toLowerCase(),
            status: comp.status.toLowerCase().replace("_open", ""), // Normalize status (e.g., REGISTRATION_OPEN -> registration)
          }));
          setCompetitions(normalizedCompetitions);
        } else {
          throw new Error("No competitions found");
        }
      } catch (err) {
        setError("Failed to fetch competitions: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const filteredCompetitions = competitions.filter((competition) => {
    const matchesFilter = filter === "all" || competition.status === filter;
    const matchesSearch =
      competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { bg: "bg-green-100", text: "text-green-800", label: "Ongoing" },
      upcoming: { bg: "bg-blue-100", text: "text-blue-800", label: "Upcoming" },
      registration: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Registration Open" },
      completed: { bg: "bg-gray-100", text: "text-gray-800", label: "Completed" }, // Added completed status
    };
    const config = statusConfig[status] || statusConfig["upcoming"];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Available Competitions</h1>
          <p className="text-gray-600 mt-1">Discover and register for exciting competitions</p>
        </div>
      </div>

      {/* Filters and Search */}
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
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
      </div>

      {/* Competition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitions.map((competition) => (
          <div key={competition.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{competition.title}</h3>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-2">
                    {competition.category}
                  </span>
                </div>
                {getStatusBadge(competition.status)}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{competition.description}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {competition.startDate} - {competition.endDate}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Registration: {competition.registrationDeadline}</span>
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
                  <span className="font-medium">Prize: {competition.prizePool}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Priority:</span>
                  <span className={`text-xs font-medium ${getPriorityColor(competition.priority)}`}>
                    {competition.priority.toUpperCase()}
                  </span>
                </div>
                <Link
                  to={`/student/competitions/${competition.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompetitions.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}