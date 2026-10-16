import { useQuery } from 'react-query'
import api from '../../services/api'
import { XCircle, Calendar } from 'lucide-react'

export default function MesAbsences() {
  const { data: absences, isLoading } = useQuery('etudiant-absences', () =>
    api.get('/etudiant/mes-absences').then((res) => res.data)
  )

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  const absencesList = absences?.filter(a => a.statut === 'absent') || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Absences</h1>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Module</th>
              <th className="text-left py-3 px-4">Professeur</th>
              <th className="text-left py-3 px-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {absencesList.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                <td className="py-3 px-4">{a.module?.nom}</td>
                <td className="py-3 px-4">{a.professeur?.prenom} {a.professeur?.nom}</td>
                <td className="py-3 px-4"><span className="flex items-center gap-1 text-red-600"><XCircle size={16} /> Absent</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {absencesList.length === 0 && <p className="text-center py-8 text-gray-500">Aucune absence enregistrée</p>}
      </div>
    </div>
  )
}
