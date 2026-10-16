import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function GestionNotes() {
  const [selectedClasse, setSelectedClasse] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [selectedExamen, setSelectedExamen] = useState('')
  const [notes, setNotes] = useState({})

  const queryClient = useQueryClient()

  // Récupérer les classes du professeur
  const { data: classes } = useQuery('prof-classes', () =>
    api.get('/professeur/mes-classes').then((res) => res.data)
  )

  // Récupérer les modules du professeur
  const { data: modules } = useQuery('prof-modules', () =>
    api.get('/professeur/mes-modules').then((res) => res.data)
  )

  // Récupérer les examens du module sélectionné
  const { data: examens } = useQuery(
    ['examens-module', selectedModule],
    () => api.get(`/professeur/modules/${selectedModule}/examens`).then((res) => res.data),
    { enabled: !!selectedModule }
  )

  // Récupérer les étudiants quand classe + module + examen sont sélectionnés
  const { data: dataEtudiants, isLoading: loadingEtudiants } = useQuery(
    ['etudiants-notes', selectedClasse, selectedModule, selectedExamen],
    () => api.get(`/professeur/classes/${selectedClasse}/modules/${selectedModule}/etudiants`).then((res) => res.data),
    { 
      enabled: !!selectedClasse && !!selectedModule && !!selectedExamen,
    }
  )

  // Synchroniser les notes avec les données reçues
  useEffect(() => {
    if (dataEtudiants?.etudiants) {
      const initialNotes = {}
      dataEtudiants.etudiants.forEach(etudiant => {
        initialNotes[etudiant.id] = etudiant.note || ''
      })
      setNotes(initialNotes)
    }
  }, [dataEtudiants])

  // Mutation pour sauvegarder les notes
  const saveMutation = useMutation(
    (data) => api.post('/professeur/notes', data),
    {
      onSuccess: () => {
        toast.success('Notes enregistrées avec succès')
        queryClient.invalidateQueries(['etudiants-notes', selectedClasse, selectedModule, selectedExamen])
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
      }
    }
  )

  // Mutation pour publier les notes
  const publishMutation = useMutation(
    (data) => api.post('/professeur/notes/publish', data),
    {
      onSuccess: (res) => {
        toast.success(res.data.message || 'Notes publiées avec succès')
        queryClient.invalidateQueries(['etudiants-notes', selectedClasse, selectedModule, selectedExamen])
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Erreur lors de la publication')
      }
    }
  )

  const handleNoteChange = (etudiantId, valeur) => {
    setNotes(prev => ({
      ...prev,
      [etudiantId]: valeur
    }))
  }

  const handleSave = () => {
    const notesData = Object.entries(notes)
      .filter(([_, valeur]) => valeur !== '' && valeur !== null)
      .map(([etudiant_id, valeur]) => {
        const val = parseFloat(valeur)
        if (isNaN(val) || val < 0 || val > 20) return null
        return {
          etudiant_id: parseInt(etudiant_id),
          module_id: parseInt(selectedModule),
          examen_id: parseInt(selectedExamen),
          note: val,
        }
      })
      .filter(Boolean)

    if (notesData.length === 0) {
      toast.error('Aucune note valide à enregistrer')
      return
    }

    saveMutation.mutate({ notes: notesData })
  }

  const handlePublish = () => {
    if (!selectedModule || !selectedExamen) {
      toast.error('Veuillez sélectionner un module et un examen')
      return
    }
    publishMutation.mutate({
      module_id: parseInt(selectedModule),
      examen_id: parseInt(selectedExamen)
    })
  }

  // Get selected examen type label
  const selectedExamenType = examens?.find(e => e.id.toString() === selectedExamen)?.type
  const examenTypeLabels = {
    'controle': 'Contrôle',
    'examen_final': 'Examen Final',
    'rattrapage': 'Rattrapage'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Notes</h1>

      {/* Sélection Classe, Module et Examen */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Classe</label>
          <select
            className="input w-full"
            value={selectedClasse}
            onChange={(e) => {
              setSelectedClasse(e.target.value)
              setSelectedModule('')
              setSelectedExamen('')
              setNotes({})
            }}
          >
            <option value="">Sélectionner une classe</option>
            {classes?.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom} - {classe.filiere?.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Module</label>
          <select
            className="input w-full"
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value)
              setSelectedExamen('')
              setNotes({})
            }}
            disabled={!selectedClasse}
          >
            <option value="">
              {!selectedClasse ? 'Sélectionnez d\'abord une classe' : 'Sélectionner un module'}
            </option>
            {modules
              ?.filter(m => {
                const classe = classes?.find(c => c.id.toString() === selectedClasse)
                return classe && m.filiere_id === classe.filiere_id
              })
              .map((module) => (
                <option key={module.id} value={module.id}>
                  {module.nom}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Examen</label>
          <select
            className="input w-full"
            value={selectedExamen}
            onChange={(e) => {
              setSelectedExamen(e.target.value)
              setNotes({})
            }}
            disabled={!selectedModule}
          >
            <option value="">
              {!selectedModule ? 'Sélectionnez d\'abord un module' : 'Sélectionner un examen'}
            </option>
            {examens?.map((examen) => (
              <option key={examen.id} value={examen.id}>
                {examenTypeLabels[examen.type] || examen.type} - {examen.date?.split('T')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type d'examen affiché */}
      {selectedExamenType && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            <Eye size={16} />
            Type d'examen: {examenTypeLabels[selectedExamenType] || selectedExamenType}
          </span>
        </div>
      )}

      {/* Table des étudiants */}
      {selectedClasse && selectedModule && selectedExamen && (
        <div className="card">
          {loadingEtudiants ? (
            <div className="text-center py-8">Chargement...</div>
          ) : dataEtudiants?.error ? (
            <div className="text-center py-8 text-red-600">{dataEtudiants.error}</div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {dataEtudiants?.classe?.nom} - {dataEtudiants?.module?.nom}
                </h2>
                <div className="flex gap-3">
                  <button 
                    onClick={handlePublish}
                    className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    disabled={publishMutation.isLoading}
                  >
                    <Eye size={18} />
                    {publishMutation.isLoading ? 'Publication...' : 'Publier les notes'}
                  </button>
                  <button 
                    onClick={handleSave}
                    className="btn-primary"
                    disabled={saveMutation.isLoading}
                  >
                    {saveMutation.isLoading ? 'Enregistrement...' : 'Enregistrer les notes'}
                  </button>
                </div>
              </div>

              {dataEtudiants?.etudiants?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Aucun étudiant dans cette classe</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {/* <th className="text-left py-3 px-4">Matricule</th> */}
                      <th className="text-left py-3 px-4">Nom</th>
                      <th className="text-left py-3 px-4">Prénom</th>
                      <th className="text-left py-3 px-4">Note (/20)</th>
                      <th className="text-left py-3 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataEtudiants?.etudiants?.map((etudiant) => (
                      <tr key={etudiant.id} className="border-b hover:bg-gray-50">
                        {/* <td className="py-3 px-4">{etudiant.cin}</td> */}
                        <td className="py-3 px-4">{etudiant.nom}</td>
                        <td className="py-3 px-4">{etudiant.prenom}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            className="input w-24"
                            value={notes[etudiant.id] || ''}
                            onChange={(e) => handleNoteChange(etudiant.id, e.target.value)}
                            placeholder="Note"
                          />
                        </td>
                        <td className="py-3 px-4">
                          {etudiant.note ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                              <Eye size={14} /> Enregistrée
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                              <EyeOff size={14} /> Non saisie
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
