import { Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'
import {
  LayoutDashboard, User, BookOpen, Award,
  ClipboardList, Calendar, FileDown, LogOut, FileText, GraduationCap
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/profil', icon: User, label: 'Mon Profil' },
  { path: '/mes-modules', icon: BookOpen, label: 'Mes Modules' },
  { path: '/mes-notes', icon: Award, label: 'Mes Notes' },
  { path: '/mes-devoirs', icon: FileText, label: 'Mes Devoirs' },
  { path: '/mes-absences', icon: ClipboardList, label: 'Mes Absences' },
  { path: '/emploi-temps', icon: Calendar, label: 'Emploi du Temps' },
  { path: '/cours', icon: FileDown, label: 'Supports Cours' },
]

export default function EtudiantLayout() {
  const { user, logout } = useAuthStore()

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header centré avec GraduationCap */}
        <div className="p-6 border-b flex flex-col items-center text-center">
          {/* Icône GraduationCap centrée */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <GraduationCap size={32} className="text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-primary-700">SMS Étudiant</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.name || 'Étudiant'}</p>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}