"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp, Users, Trophy, Calendar, Download } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Chart.js to ensure client-side rendering
const Chart = dynamic(() => import("react-chartjs-2").then((mod) => mod.Chart), {
  ssr: false,
});
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CompetitionAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [registrationTrends, setRegistrationTrends] = useState([]);
  const [comp_month, setCompCount] = useState(0);
  const [std_count, setStudentCount] = useState(0);
  const [competitionPerformance, setCompetitionPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch counts
        const countResponse = await axios.get("https://comp-kyir.onrender.com/api/analytics/count", {
          params: { period: selectedPeriod },
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        setAnalyticsData(countResponse.data.data);

        // Fetch category breakdown
        const categoryResponse = await axios.get("https://comp-kyir.onrender.com/api/analytics/category");
        const categories = categoryResponse.data.out_data.reduce((acc, item) => {
          acc[item.category] = item.count;
          return acc;
        }, {});
        setCategoryBreakdown(categories);

        // Fetch registration trends
        const trendsResponse = await axios.get("https://comp-kyir.onrender.com/api/analytics/month");
        setRegistrationTrends(trendsResponse.data.data);

        // Fetch monthly competition and student counts
        const stdcount = await axios.get("https://comp-kyir.onrender.com/api/analytics/std");
        setStudentCount(stdcount.data.data);

        const compcount = await axios.get("https://comp-kyir.onrender.com/api/analytics/comp");
        setCompCount(compcount.data.data);

        // Fetch top competitions
        const mostResponse = await axios.get("https://comp-kyir.onrender.com/api/analytics/most");
        const performance = mostResponse.data.data.map((comp) => ({
          id: comp.id,
          title: comp.name,
          category: comp.category,
          status: comp.status,
          prizePool: comp.prize_pool,
          registrationCount: comp._count.teams,
        }));
        setCompetitionPerformance(performance);

        console.log("Fetched analytics:", {
          counts: countResponse.data.data,
          categories: categoryResponse.data.out_data,
          trends: trendsResponse.data.data,
          topCompetitions: mostResponse.data.data,
        });
      } catch (err) {
        console.error("Error fetching analytics:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.message || "Failed to load analytics data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  // Export data
  const exportData = () => {
    if (!analyticsData) return;
    const data = {
      summary: {
        totalCompetitions: analyticsData?.comp_count || 0,
        totalStudents: analyticsData?.std_count || 0,
        totalRegistrations: analyticsData?.reg_count || 0,
        activeCompetitions: analyticsData?.act_comp || 0,
      },
      statusBreakdown: {
        registered: analyticsData?.registered_cnt || 0,
        shortlisted: analyticsData?.shortlisted_cnt || 0,
        won: analyticsData?.won_cnt || 0,
        rejected: analyticsData?.rejected_cnt || 0,
      },
      categoryBreakdown,
      registrationTrends,
      competitionPerformance,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "competition-analytics.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart.js data for Registration Trends
  const chartData = {
    labels: registrationTrends.map((data) => data.month),
    datasets: [
      {
        label: "Registrations",
        data: registrationTrends.map((data) => data.count),
        backgroundColor: "rgba(59, 130, 246, 0.5)", // bg-blue-500 with opacity
        borderColor: "rgba(59, 130, 246, 1)", // bg-blue-500
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend as it's clear from context
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} registrations in ${context.label}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Registrations",
        },
        ticks: {
          stepSize: 1, // Ensure integer ticks
        },
      },
    },
  };

  return (
    <div className="space-y-6 p-4">
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
            disabled={isLoading}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            disabled={isLoading || !analyticsData}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
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
            onClick={() => setSelectedPeriod(selectedPeriod)} // Trigger re-fetch
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Competitions</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.comp_count || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">{`+${comp_month || 0} this month`}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.std_count || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">{`+${std_count || 0} this month`}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.reg_count || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">
                  {registrationTrends.length > 0
                    ? `+${registrationTrends[registrationTrends.length - 1].count} this month`
                    : "+0 this month"}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Competitions</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.act_comp || 0}</p>
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
                {[
                  { status: "registered", count: analyticsData?.registered_cnt || 0 },
                  { status: "shortlisted", count: analyticsData?.shortlisted_cnt || 0 },
                  { status: "won", count: analyticsData?.won_cnt || 0 },
                  { status: "rejected", count: analyticsData?.rejected_cnt || 0 },
                ].map(({ status, count }) => {
                  const percentage = analyticsData?.reg_count
                    ? ((count / analyticsData.reg_count) * 100).toFixed(1)
                    : 0;
                  const statusConfig = {
                    registered: { color: "bg-blue-500", label: "Registered" },
                    shortlisted: { color: "bg-yellow-500", label: "Shortlisted" },
                    won: { color: "bg-green-500", label: "Won" },
                    rejected: { color: "bg-red-500", label: "Rejected" },
                  };
                  const config = statusConfig[status] || { color: "bg-gray-500", label: status };

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
                  );
                })}
              </div>
            </div>

            {/* Competition Categories */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Competition Categories</h2>
              <div className="space-y-4">
                {Object.entries(categoryBreakdown).map(([category, count]) => {
                  const percentage = analyticsData?.comp_count
                    ? ((count / analyticsData.comp_count) * 100).toFixed(1)
                    : 0;
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
                  );
                })}
              </div>
            </div>
          </div>

          {/* Registration Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Trends</h2>
            <div className="h-80">
              {registrationTrends.length > 0 ? (
                <Chart
                  type="bar"
                  data={chartData}
                  options={chartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500">
                  No registration data available
                </div>
              )}
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
                          <p className="text-sm text-gray-600">N/A</p>
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
                            competition.status === "ONGOING"
                              ? "bg-green-100 text-green-800"
                              : competition.status === "REGISTRATION"
                              ? "bg-yellow-100 text-yellow-800"
                              : competition.status === "UPCOMING"
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
        </>
      )}
    </div>
  );
}