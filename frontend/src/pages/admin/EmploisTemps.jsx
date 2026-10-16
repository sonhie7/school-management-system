import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function EmploisTemps() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedClasse, setSelectedClasse] = useState('')
  const [formData, setFormData] = useState({
    classe_id: '', jour: 'Lundi', heure_debut: '08:00', heure_fin: '10:00',
    module_id: '', professeur_id: '', salle: ''
  })

  const queryClient = useQueryClient()

  const { data: emplois, isLoading } = useQuery(['emplois-temps', selectedClasse], () =>
    selectedClasse
      ? api.get(`/admin/emplois-temps/classe/${selectedClasse}`).then((res) => res.data)
      : api.get('/admin/emplois-temps').then((res) => res.data)
  )

  const { data: classes } = useQuery('classes', () =>
    api.get('/admin/classes').then((res) => res.data)
  )

  const { data: modules } = useQuery('modules', () =>
    api.get('/admin/modules').then((res) => res.data)
  )

  const { data: professeurs } = useQuery('professeurs', () =>
    api.get('/admin/professeurs').then((res) => res.data)
  )

  const createMutation = useMutation(
    (data) => api.post('/admin/emplois-temps', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('emplois-temps')
        setShowModal(false)
        resetForm()
        toast.success('Séance ajoutée avec succès')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/emplois-temps/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('emplois-temps')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Séance modifiée avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/emplois-temps/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('emplois-temps')
        setDeleteId(null)
        toast.success('Séance supprimée')
      }
    }
  )

  const resetForm = () => {
    setFormData({ classe_id: '', jour: 'Lundi', heure_debut: '08:00', heure_fin: '10:00', module_id: '', professeur_id: '', salle: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (emp) => {
    setEditingId(emp.id)
    setFormData({
      classe_id: emp.classe_id, jour: emp.jour,
      heure_debut: emp.heure_debut, heure_fin: emp.heure_fin,
      module_id: emp.module_id, professeur_id: emp.professeur_id, salle: emp.salle
    })
    setShowModal(true)
  }

  const exportPdf = async () => {
    if (!selectedClasse) {
      toast.error('Veuillez sélectionner une classe')
      return
    }

    let url = null
    try {
      const response = await api.get(
        `/admin/emplois-temps/${selectedClasse}/pdf`,
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `emploi-du-temps-classe-${selectedClasse}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('PDF téléchargé avec succès')
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé.')
      } else {
        toast.error('Erreur lors du téléchargement du PDF')
      }
    } finally {
      if (url) {
        window.URL.revokeObjectURL(url)
      }
    }
  }
  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Emplois du Temps</h1>
        <div className="flex gap-3">
          <select className="input w-48" value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)}>
            <option value="">Toutes les classes</option>
            {classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button onClick={exportPdf} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> PDF
          </button>
          <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Ajouter
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Classe</th>
              <th className="text-left py-3 px-4">Jour</th>
              <th className="text-left py-3 px-4">Heure Début</th>
              <th className="text-left py-3 px-4">Heure Fin</th>
              <th className="text-left py-3 px-4">Module</th>
              <th className="text-left py-3 px-4">Professeur</th>
              <th className="text-left py-3 px-4">Salle</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {emplois?.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{e.classe?.nom}</td>
                <td className="py-3 px-4">{e.jour}</td>
                <td className="py-3 px-4">{e.heure_debut}</td>
                <td className="py-3 px-4">{e.heure_fin}</td>
                <td className="py-3 px-4">{e.module?.nom}</td>
                <td className="py-3 px-4">{e.professeur?.prenom} {e.professeur?.nom}</td>
                <td className="py-3 px-4">{e.salle}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteId(e.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editingId ? 'Modifier' : 'Ajouter'} une Séance`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Classe</label><select className="input" value={formData.classe_id} onChange={(e) => setFormData({...formData, classe_id: e.target.value})} required><option value="">Sélectionner</option>{classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Jour</label><select className="input" value={formData.jour} onChange={(e) => setFormData({...formData, jour: e.target.value})}>{jours.map(j => <option key={j} value={j}>{j}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Heure Début</label><input type="time" className="input" value={formData.heure_debut} onChange={(e) => setFormData({...formData, heure_debut: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Heure Fin</label><input type="time" className="input" value={formData.heure_fin} onChange={(e) => setFormData({...formData, heure_fin: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Module</label><select className="input" value={formData.module_id} onChange={(e) => setFormData({...formData, module_id: e.target.value})} required><option value="">Sélectionner</option>{modules?.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Professeur</label><select className="input" value={formData.professeur_id} onChange={(e) => setFormData({...formData, professeur_id: e.target.value})} required><option value="">Sélectionner</option>{professeurs?.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Salle</label><input className="input" value={formData.salle} onChange={(e) => setFormData({...formData, salle: e.target.value})} required /></div>
          <div className="col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{editingId ? 'Modifier' : 'Ajouter'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Supprimer la séance" message="Êtes-vous sûr de vouloir supprimer cette séance ?" />
    </div>
  )
}
