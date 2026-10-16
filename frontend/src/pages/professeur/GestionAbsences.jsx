import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Save, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GestionAbsences() {
  const [selectedClasse, setSelectedClasse] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [absences, setAbsences] = useState({})

  const queryClient = useQueryClient()

  const { data: classes } = useQuery('prof-classes', () =>
    api.get('/professeur/mes-classes').then((res) => res.data)
  )

  const { data: modules } = useQuery('prof-modules', () =>
    api.get('/professeur/mes-modules').then((res) => res.data)
  )

  const { data: etudiants, isLoading: loadingEtudiants } = useQuery(
    ['etudiants-absences', selectedClasse, selectedModule],
    () => api.get(`/professeur/classes/${selectedClasse}/modules/${selectedModule}/absences`).then((res) => res.data),
    { enabled: !!selectedClasse && !!selectedModule }
  )

  const saveAbsencesMutation = useMutation(
    (data) => api.post('/professeur/absences', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['etudiants-absences'])
        toast.success('Absences enregistrées avec succès')
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
      }
    }
  )

  const handleAbsenceChange = (etudiantId, statut) => {
    setAbsences(prev => ({ ...prev, [etudiantId]: statut }))
  }

  const handleSave = () => {
    const absencesArray = Object.entries(absences).map(([etudiant_id, statut]) => ({
      etudiant_id: parseInt(etudiant_id),
      statut
    }))

    saveAbsencesMutation.mutate({
      classe_id: selectedClasse,
      module_id: selectedModule,
      date,
      absences: absencesArray
    })
  }

  // Filtrer les modules par la filière de la classe sélectionnée
  const selectedClasseData = classes?.find(c => c.id.toString() === selectedClasse)
  const filteredModules = modules?.filter(m => m.filiere_id === selectedClasseData?.filiere_id) || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Absences</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Classe</label>
            <select 
              className="input" 
              value={selectedClasse} 
              onChange={(e) => { 
                setSelectedClasse(e.target.value); 
                setSelectedModule('');
                setAbsences({});
              }}
            >
              <option value="">Sélectionner une classe</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Module</label>
            <select 
              className="input" 
              value={selectedModule} 
              onChange={(e) => { 
                setSelectedModule(e.target.value);
                setAbsences({});
              }} 
              disabled={!selectedClasse}
            >
              <option value="">
                {!selectedClasse ? 'Sélectionnez d\'abord une classe' : 'Sélectionner un module'}
              </option>
              {filteredModules.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleSave} 
              className="btn-primary flex items-center gap-2 w-full justify-center"
              disabled={saveAbsencesMutation.isLoading || !selectedClasse || !selectedModule}
            >
              {saveAbsencesMutation.isLoading ? 'Enregistrement...' : <><Save size={18} /> Enregistrer</>}
            </button>
          </div>
        </div>
      </div>

      {selectedClasse && selectedModule && (
        <div className="card">
          {loadingEtudiants ? (
            <div className="text-center py-8">Chargement...</div>
          ) : etudiants?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun étudiant dans cette classe</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">CIN</th>
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Prénom</th>
                  <th className="text-left py-3 px-4">Statut Actuel</th>
                  <th className="text-left py-3 px-4">Présent</th>
                  <th className="text-left py-3 px-4">Absent</th>
                </tr>
              </thead>
              <tbody>
                {etudiants?.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{e.cin}</td>
                    <td className="py-3 px-4">{e.nom}</td>
                    <td className="py-3 px-4">{e.prenom}</td>
                    <td className="py-3 px-4">
                      {e.absences?.[0]?.statut === 'present' ? (
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle size={16} /> Présent</span>
                      ) : e.absences?.[0]?.statut === 'absent' ? (
                        <span className="flex items-center gap-1 text-red-600"><XCircle size={16} /> Absent</span>
                      ) : (
                        <span className="text-gray-400">Non renseigné</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="radio"
                        name={`absence-${e.id}`}
                        checked={absences[e.id] === 'present'}
                        onChange={() => handleAbsenceChange(e.id, 'present')}
                        className="w-5 h-5 text-green-600"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="radio"
                        name={`absence-${e.id}`}
                        checked={absences[e.id] === 'absent'}
                        onChange={() => handleAbsenceChange(e.id, 'absent')}
                        className="w-5 h-5 text-red-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
