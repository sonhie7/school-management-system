import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function Filieres() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({ nom: '', code: '', description: '' })

  const queryClient = useQueryClient()

  const { data: filieres, isLoading } = useQuery('filieres', () =>
    api.get('/admin/filieres').then((res) => res.data)
  )

  const createMutation = useMutation(
    (data) => api.post('/admin/filieres', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('filieres')
        setShowModal(false)
        resetForm()
        toast.success('Filière ajoutée avec succès')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/filieres/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('filieres')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Filière modifiée avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/filieres/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('filieres')
        setDeleteId(null)
        toast.success('Filière supprimée')
      }
    }
  )

  const resetForm = () => setFormData({ nom: '', code: '', description: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (f) => {
    setEditingId(f.id)
    setFormData({ nom: f.nom, code: f.code, description: f.description || '' })
    setShowModal(true)
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Filières</h1>
        <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Ajouter
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Code</th>
              <th className="text-left py-3 px-4">Nom</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filieres?.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-mono font-bold">{f.code}</td>
                <td className="py-3 px-4">{f.nom}</td>
                <td className="py-3 px-4 text-gray-500">{f.description || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteId(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editingId ? 'Modifier' : 'Ajouter'} une Filière`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Code</label><input className="input" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Nom</label><input className="input" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{editingId ? 'Modifier' : 'Ajouter'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Supprimer la filière" message="Êtes-vous sûr de vouloir supprimer cette filière ?" />
    </div>
  )
}
