import { useQuery } from 'react-query'
import api from '../../services/api'
import { BookOpen, Users, GraduationCap } from 'lucide-react'

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

export default function ProfDashboard() {
  const { data: stats } = useQuery('prof-dashboard', () =>
    api.get('/professeur/dashboard').then((res) => res.data)
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Professeur</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Mes Modules" value={stats?.modules || 0} icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Mes Classes" value={stats?.classes || 0} icon={Users} color="bg-green-500" />
        <StatCard title="Mes Étudiants" value={stats?.etudiants || 0} icon={GraduationCap} color="bg-purple-500" />
      </div>
    </div>
  )
}
