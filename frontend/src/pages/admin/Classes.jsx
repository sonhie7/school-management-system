import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function Classes() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({ nom: '', niveau: '', filiere_id: '' })

  const queryClient = useQueryClient()

  const { data: classes, isLoading } = useQuery('classes', () =>
    api.get('/admin/classes').then((res) => res.data)
  )

  const { data: filieres } = useQuery('filieres', () =>
    api.get('/admin/filieres').then((res) => res.data)
  )

  const createMutation = useMutation(
    (data) => api.post('/admin/classes', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes')
        setShowModal(false)
        resetForm()
        toast.success('Classe ajoutée avec succès')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/classes/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Classe modifiée avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/classes/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes')
        setDeleteId(null)
        toast.success('Classe supprimée')
      }
    }
  )

  const resetForm = () => setFormData({ nom: '', niveau: '', filiere_id: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (c) => {
    setEditingId(c.id)
    setFormData({ nom: c.nom, niveau: c.niveau, filiere_id: c.filiere_id })
    setShowModal(true)
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Classes</h1>
        <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Ajouter
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Nom</th>
              <th className="text-left py-3 px-4">Niveau</th>
              <th className="text-left py-3 px-4">Filière</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes?.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{c.nom}</td>
                <td className="py-3 px-4">{c.niveau}</td>
                <td className="py-3 px-4">{c.filiere?.nom}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteId(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editingId ? 'Modifier' : 'Ajouter'} une Classe`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nom</label><input className="input" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Niveau</label><input className="input" value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Filière</label><select className="input" value={formData.filiere_id} onChange={(e) => setFormData({...formData, filiere_id: e.target.value})} required><option value="">Sélectionner</option>{filieres?.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}</select></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{editingId ? 'Modifier' : 'Ajouter'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Supprimer la classe" message="Êtes-vous sûr de vouloir supprimer cette classe ?" />
    </div>
  )
}
