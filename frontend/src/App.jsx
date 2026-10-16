import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import LoginPage from './pages/auth/LoginPage'
import AdminLayout from './components/layout/AdminLayout'
import ProfesseurLayout from './components/layout/ProfesseurLayout'
import EtudiantLayout from './components/layout/EtudiantLayout'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import Etudiants from './pages/admin/Etudiants'
import Professeurs from './pages/admin/Professeurs'
import Modules from './pages/admin/Modules'
import EmploisTemps from './pages/admin/EmploisTemps'
import Examens from './pages/admin/Examens'
import Filieres from './pages/admin/Filieres'
import Classes from './pages/admin/Classes'

// Professeur pages
import ProfDashboard from './pages/professeur/Dashboard'
import ProfModules from './pages/professeur/MesModules'
import ProfClasses from './pages/professeur/MesClasses'
import GestionNotes from './pages/professeur/GestionNotes'
import GestionAbsences from './pages/professeur/GestionAbsences'
import DepotCours from './pages/professeur/DepotCours'
import Devoirs from './pages/professeur/Devoirs'

// Etudiant pages
import EtudiantDashboard from './pages/etudiant/Dashboard'
import MonProfil from './pages/etudiant/MonProfil'
import MesModules from './pages/etudiant/MesModules'
import MesNotes from './pages/etudiant/MesNotes'
import MesAbsences from './pages/etudiant/MesAbsences'
import MonEmploiTemps from './pages/etudiant/MonEmploiTemps'
import MesCours from './pages/etudiant/MesCours'
import MesDevoirs from './pages/etudiant/MesDevoirs'

function App() {
  const { user } = useAuthStore()

  if (!user) {
    return <LoginPage />
  }

  const role = user.role

  // Si le rôle n'est pas reconnu, rediriger vers login
  if (!['admin', 'professeur', 'etudiant'].includes(role)) {
    return <Navigate to="/login" replace />
  }

  return (
    <Routes>
      {role === 'admin' && (
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="etudiants" element={<Etudiants />} />
          <Route path="professeurs" element={<Professeurs />} />
          <Route path="modules" element={<Modules />} />
          <Route path="emplois-temps" element={<EmploisTemps />} />
          <Route path="examens" element={<Examens />} />
          <Route path="filieres" element={<Filieres />} />
          <Route path="classes" element={<Classes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}

      {role === 'professeur' && (
        <Route path="/" element={<ProfesseurLayout />}>
          <Route index element={<ProfDashboard />} />
          <Route path="mes-modules" element={<ProfModules />} />
          <Route path="mes-classes" element={<ProfClasses />} />
          <Route path="notes" element={<GestionNotes />} />
          <Route path="absences" element={<GestionAbsences />} />
          <Route path="cours" element={<DepotCours />} />
          <Route path="devoirs" element={<Devoirs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}

      {role === 'etudiant' && (
        <Route path="/" element={<EtudiantLayout />}>
          <Route index element={<EtudiantDashboard />} />
          <Route path="profil" element={<MonProfil />} />
          <Route path="mes-modules" element={<MesModules />} />
          <Route path="mes-notes" element={<MesNotes />} />
          <Route path="mes-devoirs" element={<MesDevoirs />} />
          <Route path="mes-absences" element={<MesAbsences />} />
          <Route path="emploi-temps" element={<MonEmploiTemps />} />
          <Route path="cours" element={<MesCours />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}

      {/* Route fallback globale */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
