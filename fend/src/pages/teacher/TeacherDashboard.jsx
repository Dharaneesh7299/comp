import { Routes, Route } from "react-router-dom"
import TeacherLayout from "../../components/teacher/TeacherLayout"
import TeacherHome from "../../components/teacher/TeacherHome"
import ManageCompetitions from "../../components/teacher/ManageCompetitions"
import ManageStudents from "../../components/teacher/ManageStudents"
import CompetitionAnalytics from "../../components/teacher/CompetitionAnalytics"
import TeacherProfile from "../../components/teacher/TeacherProfile"

export default function TeacherDashboard() {
  return (
    <TeacherLayout>
      <Routes>
        <Route path="/" element={<TeacherHome />} />
        <Route path="/competitions" element={<ManageCompetitions />} />
        <Route path="/students" element={<ManageStudents />} />
        <Route path="/analytics" element={<CompetitionAnalytics />} />
        <Route path="/profile" element={<TeacherProfile />} />
      </Routes>
    </TeacherLayout>
  )
}
