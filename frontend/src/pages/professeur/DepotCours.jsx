import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { downloadFile } from '../../services/api'
import { Upload, FileText, Trash2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DepotCours() {
  const [titre, setTitre] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [classeId, setClasseId] = useState('')
  const [file, setFile] = useState(null)

  const queryClient = useQueryClient()

  const { data: cours, isLoading } = useQuery('cours', () =>
    api.get('/professeur/cours').then((res) => res.data)
  )

  const { data: modules } = useQuery('prof-modules', () =>
    api.get('/professeur/mes-modules').then((res) => res.data)
  )

  const { data: classes } = useQuery('prof-classes', () =>
    api.get('/professeur/mes-classes').then((res) => res.data)
  )

  const uploadMutation = useMutation(
    async (formData) => {
      return api.post('/professeur/cours', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cours')
        setTitre('')
        setModuleId('')
        setClasseId('')
        setFile(null)
        toast.success('Cours déposé avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/professeur/cours/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cours')
        toast.success('Cours supprimé')
      }
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('titre', titre)
    formData.append('module_id', moduleId)
    formData.append('classe_id', classeId)
    formData.append('fichier', file)
    uploadMutation.mutate(formData)
  }

  const handleDownload = async (cour) => {
    try {
      const filename = `${cour.titre}.${cour.type_fichier}`
      await downloadFile(`/cours/${cour.id}/download`, filename)
    } catch (err) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dépôt des Supports de Cours</h1>

      <div className="card mb-6">
        <h2 className="font-bold mb-4">Nouveau Cours</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titre</label>
            <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Module</label>
            <select className="input" value={moduleId} onChange={(e) => setModuleId(e.target.value)} required>
              <option value="">Sélectionner</option>
              {modules?.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Classe</label>
            <select className="input" value={classeId} onChange={(e) => setClasseId(e.target.value)} required>
              <option value="">Sélectionner</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fichier (PDF)</label>
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="input py-1" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary flex items-center gap-2 w-full justify-center">
              <Upload size={18} /> Déposer
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="font-bold mb-4">Mes Cours</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Titre</th>
              <th className="text-left py-3 px-4">Module</th>
              <th className="text-left py-3 px-4">Classe</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cours?.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  {c.titre}
                </td>
                <td className="py-3 px-4">{c.module?.nom}</td>
                <td className="py-3 px-4">{c.classe?.nom || '—'}</td>
                <td className="py-3 px-4 uppercase">{c.type_fichier}</td>
                <td className="py-3 px-4">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleDownload(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Download size={16} /></button>
                    <button onClick={() => deleteMutation.mutate(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
