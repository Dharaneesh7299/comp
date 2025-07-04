"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Trophy, User, GraduationCap, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!role) {
      setError("Please select a role")
      return
    }

    setLoading(true)
    setError("")

    try {
      await login(email, password, role)
      navigate(`/${role}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-white hover:text-blue-200 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-2">Sign in to your CompeteHub account</p>
            </div>

            {!role ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">Choose Your Role</h2>

                <button
                  onClick={() => setRole("student")}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Student</h3>
                      <p className="text-gray-600 text-sm">Register for competitions and track your progress</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setRole("teacher")}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Teacher</h3>
                      <p className="text-gray-600 text-sm">Manage competitions and monitor student progress</p>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                      role === "student" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {role === "student" ? <User className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                    <span className="font-medium capitalize">{role} Login</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRole("")}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 block mx-auto"
                  >
                    Change role
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Demo credentials: any email/password combination</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
