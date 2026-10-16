import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function Modules() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({
    nom: '', code: '', filiere_id: '', classe_id: '', volume_horaire: '', coefficient: '', professeur_id: ''
  })

  const queryClient = useQueryClient()

  const { data: modules, isLoading } = useQuery('modules', () =>
    api.get('/admin/modules').then((res) => res.data)
  )

  const { data: filieres } = useQuery('filieres', () =>
    api.get('/admin/filieres').then((res) => res.data)
  )

  const { data: classes } = useQuery('classes', () =>
    api.get('/admin/classes').then((res) => res.data)
  )

  const { data: professeurs } = useQuery('professeurs', () =>
    api.get('/admin/professeurs').then((res) => res.data)
  )

  const createMutation = useMutation(
    (data) => api.post('/admin/modules', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('modules')
        setShowModal(false)
        resetForm()
        toast.success('Module ajouté avec succès')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/modules/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('modules')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Module modifié avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/modules/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('modules')
        setDeleteId(null)
        toast.success('Module supprimé')
      }
    }
  )

  const resetForm = () => {
    setFormData({ nom: '', code: '', filiere_id: '', classe_id: '', volume_horaire: '', coefficient: '', professeur_id: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Remove empty classe_id
    const data = { ...formData }
    if (!data.classe_id) delete data.classe_id
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (mod) => {
    setEditingId(mod.id)
    setFormData({
      nom: mod.nom, code: mod.code, filiere_id: mod.filiere_id,
      classe_id: mod.classe_id || '', volume_horaire: mod.volume_horaire,
      coefficient: mod.coefficient, professeur_id: mod.professeur_id
    })
    setShowModal(true)
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Modules</h1>
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
              <th className="text-left py-3 px-4">Filière</th>
              <th className="text-left py-3 px-4">Classe</th>
              <th className="text-left py-3 px-4">Volume H.</th>
              <th className="text-left py-3 px-4">Coefficient</th>
              <th className="text-left py-3 px-4">Professeur</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules?.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-sm">{m.code}</td>
                <td className="py-3 px-4">{m.nom}</td>
                <td className="py-3 px-4">{m.filiere?.nom}</td>
                <td className="py-3 px-4">{m.classe?.nom || '—'}</td>
                <td className="py-3 px-4">{m.volume_horaire}h</td>
                <td className="py-3 px-4">{m.coefficient}</td>
                <td className="py-3 px-4">{m.professeur?.prenom} {m.professeur?.nom}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteId(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editingId ? 'Modifier' : 'Ajouter'} un Module`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Code</label><input className="input" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Nom</label><input className="input" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Filière</label>
            <select className="input" value={formData.filiere_id} onChange={(e) => setFormData({...formData, filiere_id: e.target.value})} required>
              <option value="">Sélectionner</option>
              {filieres?.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
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
            <label className="block text-sm font-medium mb-1">Professeur</label>
            <select className="input" value={formData.professeur_id} onChange={(e) => setFormData({...formData, professeur_id: e.target.value})} required>
              <option value="">Sélectionner</option>
              {professeurs?.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Volume Horaire</label><input type="number" className="input" value={formData.volume_horaire} onChange={(e) => setFormData({...formData, volume_horaire: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Coefficient</label><input type="number" step="0.1" className="input" value={formData.coefficient} onChange={(e) => setFormData({...formData, coefficient: e.target.value})} required /></div>
          <div className="col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{editingId ? 'Modifier' : 'Ajouter'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Supprimer le module" message="Êtes-vous sûr de vouloir supprimer ce module ?" />
    </div>
  )
}
