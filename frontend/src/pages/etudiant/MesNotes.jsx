import { useQuery } from 'react-query'
import api from '../../services/api'
import { Award } from 'lucide-react'

export default function MesNotes() {
  const { data: notes, isLoading } = useQuery('etudiant-notes', () =>
    api.get('/etudiant/mes-notes').then((res) => res.data)
  )

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  const examenTypeLabels = {
    'controle': 'Contrôle',
    'examen_final': 'Examen Final',
    'rattrapage': 'Rattrapage'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Notes</h1>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Module</th>
              <th className="text-left py-3 px-4">Type d'examen</th>
              <th className="text-left py-3 px-4">Note</th>
              <th className="text-left py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {notes?.map((n) => (
              <tr key={n.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{n.module?.nom}</td>
                <td className="py-3 px-4">{examenTypeLabels[n.examen?.type] || n.examen?.type || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    n.note >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{n.note}/20</span>
                </td>
                <td className="py-3 px-4">{new Date(n.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!notes || notes.length === 0) && <p className="text-center py-8 text-gray-500">Aucune note publiée pour le moment</p>}
      </div>
    </div>
  )
}
