import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const typesExamen = [
  { value: 'controle', label: 'Contrôle' },
  { value: 'examen_final', label: 'Examen Final' },
  { value: 'rattrapage', label: 'Rattrapage' },
]

export default function Examens() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    module_id: '', classe_id: '', type: 'controle', date: '', heure: '', salle: ''
  })

  const queryClient = useQueryClient()

  const { data: examens, isLoading } = useQuery('examens', () =>
    api.get('/admin/examens').then((res) => res.data)
  )

  const { data: modules } = useQuery('modules', () =>
    api.get('/admin/modules').then((res) => res.data)
  )

  const { data: classes } = useQuery('classes', () =>
    api.get('/admin/classes').then((res) => res.data)
  )

  // Filtrage des examens
  const filteredExamens = examens?.filter((ex) => {
    const term = searchTerm.toLowerCase()
    return (
      ex.module?.nom?.toLowerCase().includes(term) ||
      ex.type?.toLowerCase().includes(term) ||
      ex.salle?.toLowerCase().includes(term) ||
      ex.date?.toLowerCase().includes(term) ||
      ex.classe?.nom?.toLowerCase().includes(term)
    )
  })

  const createMutation = useMutation(
    (data) => api.post('/admin/examens', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('examens')
        setShowModal(false)
        resetForm()
        toast.success('Examen ajouté avec succès')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/examens/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('examens')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Examen modifié avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/examens/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('examens')
        setDeleteId(null)
        toast.success('Examen supprimé')
      }
    }
  )

  const resetForm = () => {
    setFormData({ module_id: '', classe_id: '', type: 'controle', date: '', heure: '', salle: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...formData }
    if (!data.classe_id) delete data.classe_id
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (ex) => {
    setEditingId(ex.id)
    setFormData({
      module_id: ex.module_id, classe_id: ex.classe_id || '',
      type: ex.type, date: ex.date ? ex.date.split('T')[0] : '',
      heure: ex.heure, salle: ex.salle
    })
    setShowModal(true)
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Examens</h1>
        <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="card mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un examen..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Module</th>
              <th className="text-left py-3 px-4">Classe</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Heure</th>
              <th className="text-left py-3 px-4">Salle</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExamens?.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{e.module?.nom}</td>
                <td className="py-3 px-4">{e.classe?.nom || '—'}</td>
                <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  e.type === 'controle' ? 'bg-blue-100 text-blue-700' :
                  e.type === 'examen_final' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>{typesExamen.find(t => t.value === e.type)?.label || e.type}</span></td>
                <td className="py-3 px-4">{e.date ? new Date(e.date).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="py-3 px-4">{e.heure}</td>
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
        {(!filteredExamens || filteredExamens.length === 0) && (
          <p className="text-center py-8 text-gray-500">Aucun examen trouvé</p>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editingId ? 'Modifier' : 'Ajouter'} un Examen`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Module</label>
            <select className="input" value={formData.module_id} onChange={(e) => setFormData({...formData, module_id: e.target.value})} required>
              <option value="">Sélectionner</option>
              {modules?.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Classe (optionnel)</label>
            <select className="input" value={formData.classe_id} onChange={(e) => setFormData({...formData, classe_id: e.target.value})}>
              <option value="">Toutes les classes</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              {typesExamen.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" className="input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heure</label>
            <input type="time" className="input" value={formData.heure} onChange={(e) => setFormData({...formData, heure: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salle</label>
            <input className="input" value={formData.salle} onChange={(e) => setFormData({...formData, salle: e.target.value})} required />
          </div>
          <div className="col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
              {createMutation.isLoading || updateMutation.isLoading ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Supprimer l'examen" message="Êtes-vous sûr de vouloir supprimer cet examen ?" />
    </div>
  )
}
