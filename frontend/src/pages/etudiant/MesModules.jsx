import { useQuery } from 'react-query'
import api from '../../services/api'
import { BookOpen, Clock, User } from 'lucide-react'

export default function MesModules() {
  const { data: modules, isLoading } = useQuery('etudiant-modules', () =>
    api.get('/etudiant/mes-modules').then((res) => res.data)
  )

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Modules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules?.map((m) => (
          <div key={m.id} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg"><BookOpen size={20} className="text-blue-600" /></div>
              <h3 className="font-bold text-lg">{m.nom}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Clock size={16} /> {m.volume_horaire} heures</div>
              <div className="flex items-center gap-2"><User size={16} /> Prof: {m.professeur?.prenom} {m.professeur?.nom}</div>
              <div>Coefficient: {m.coefficient}</div>
            </div>
          </div>
        ))}
      </div>
      {(!modules || modules.length === 0) && <p className="text-center py-8 text-gray-500">Aucun module</p>}
    </div>
  )
}
