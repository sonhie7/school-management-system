import { useQuery } from 'react-query'
import api from '../../services/api'
import { Users, GraduationCap, BookOpen, School, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

export default function AdminDashboard() {
  const { data: stats } = useQuery('admin-stats', () =>
    api.get('/admin/dashboard').then((res) => res.data)
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Étudiants" value={stats?.etudiants || 0} icon={Users} color="bg-blue-500" />
        <StatCard title="Professeurs" value={stats?.professeurs || 0} icon={GraduationCap} color="bg-green-500" />
        <StatCard title="Modules" value={stats?.modules || 0} icon={BookOpen} color="bg-purple-500" />
        <StatCard title="Classes" value={stats?.classes || 0} icon={School} color="bg-orange-500" />
        <StatCard title="Absences Aujourd'hui" value={stats?.absences_today || 0} icon={AlertTriangle} color="bg-red-500" />
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Étudiants par Filière</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.etudiants_par_filiere || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nom" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="etudiants_count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
