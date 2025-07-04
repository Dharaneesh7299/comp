import { Routes, Route } from "react-router-dom"
import StudentLayout from "../../components/student/StudentLayout"
import StudentHome from "../../components/student/StudentHome"
import StudentCompetitions from "../../components/student/StudentCompetitions"
import StudentProfile from "../../components/student/StudentProfile"
import CompetitionDetail from "../../components/student/CompetitionDetail"
import StudentTeams from "../../components/student/StudentTeams"

export default function StudentDashboard() {
  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/competitions" element={<StudentCompetitions />} />
        <Route path="/competitions/:id" element={<CompetitionDetail />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/teams" element={<StudentTeams />} />
      </Routes>
    </StudentLayout>
  )
}
