import { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'
import { School, Users, Building2, X } from 'lucide-react'

export default function ProfClasses() {
  const [selectedClasse, setSelectedClasse] = useState(null)

  const { data: classes, isLoading } = useQuery('prof-classes', () =>
    api.get('/professeur/mes-classes').then((res) => res.data)
  )

  const { data: etudiantsClasse, isLoading: loadingEtudiants } = useQuery(
    ['classe-etudiants', selectedClasse?.id],
    () => api.get(`/professeur/classes/${selectedClasse.id}/etudiants`).then((res) => res.data),
    { enabled: !!selectedClasse }
  )

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Classes</h1>

      {/* Modal pour afficher les étudiants */}
      {selectedClasse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedClasse.nom}</h2>
                <p className="text-sm text-gray-500">{selectedClasse.filiere?.nom} — {selectedClasse.niveau}</p>
              </div>
              <button onClick={() => setSelectedClasse(null)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {loadingEtudiants ? (
                <div className="text-center py-8">Chargement...</div>
              ) : etudiantsClasse?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Aucun étudiant dans cette classe</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">CIN</th>
                      <th className="text-left py-2 px-3">Nom</th>
                      <th className="text-left py-2 px-3">Prénom</th>
                      <th className="text-left py-2 px-3">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etudiantsClasse?.map((e) => (
                      <tr key={e.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{e.cin}</td>
                        <td className="py-2 px-3">{e.nom}</td>
                        <td className="py-2 px-3">{e.prenom}</td>
                        <td className="py-2 px-3">{e.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes?.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClasse(c)}
            className="card text-left hover:shadow-lg transition-shadow cursor-pointer w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <School size={20} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg">{c.nom}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Building2 size={16} /> {c.filiere?.nom}</div>
              <div className="flex items-center gap-2">Niveau: {c.niveau}</div>
              <div className="flex items-center gap-2 text-blue-600 mt-3">
                <Users size={16} />
                <span>Cliquer pour voir les étudiants</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
