import { useQuery } from 'react-query'
import api from '../../services/api'
import { AlertTriangle, BookOpen, Calendar } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
)

export default function EtudiantDashboard() {
  const { data: stats, isLoading } = useQuery('etudiant-dashboard', () =>
    api.get('/etudiant/dashboard').then((res) => res.data)
  )

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Étudiant</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Mes Absences" value={stats?.absences || 0} icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="Mes Modules" value={stats?.modules || 0} icon={BookOpen} color="bg-blue-500" />
        {/* <StatCard title="Emploi du Temps" value={stats?.emploi_temps ? 'Actif' : '-'} icon={Calendar} color="bg-green-500" /> */}
      </div>
    </div>
  )
}
