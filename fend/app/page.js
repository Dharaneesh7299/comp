"use client"

import { useState } from "react"
import Dashboard from "@/components/dashboard"
import Competitions from "@/components/competitions"
import CompetitionDetail from "@/components/competition-detail"
import Navbar from "@/components/navbar"

export default function Home() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedCompetition, setSelectedCompetition] = useState(null)

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            onViewCompetition={(comp) => {
              setSelectedCompetition(comp)
              setCurrentView("competition-detail")
            }}
          />
        )
      case "competitions":
        return (
          <Competitions
            onViewCompetition={(comp) => {
              setSelectedCompetition(comp)
              setCurrentView("competition-detail")
            }}
          />
        )
      case "competition-detail":
        return <CompetitionDetail competition={selectedCompetition} onBack={() => setCurrentView("competitions")} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto px-4 py-8">{renderView()}</main>
    </div>
  )
}
