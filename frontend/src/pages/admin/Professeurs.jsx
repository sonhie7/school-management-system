import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function Professeurs() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nom: '', prenom: '', cin: '', telephone: '', email: '', departement: '', date_recrutement: ''
  })

  const queryClient = useQueryClient()

  const { data: professeurs, isLoading } = useQuery('professeurs', () =>
    api.get('/admin/professeurs').then((res) => res.data)
  )

  const filteredProfesseurs = professeurs?.filter((p) => {
    const term = searchTerm.toLowerCase()
    return (
      p.nom?.toLowerCase().includes(term) ||
      p.prenom?.toLowerCase().includes(term) ||
      p.cin?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.departement?.toLowerCase().includes(term)
    )
  })

  const createMutation = useMutation(
    (data) => api.post('/admin/professeurs', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professeurs')
        setShowModal(false)
        resetForm()
        toast.success('Professeur ajouté avec succès')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/professeurs/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professeurs')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Professeur modifié avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/professeurs/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professeurs')
        setDeleteId(null)
        toast.success('Professeur supprimé')
      }
    }
  )

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', cin: '', telephone: '', email: '', departement: '', date_recrutement: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (prof) => {
    setEditingId(prof.id)
    setFormData({
      nom: prof.nom, prenom: prof.prenom, cin: prof.cin,
      telephone: prof.telephone, email: prof.email,
      departement: prof.departement, date_recrutement: prof.date_recrutement ? prof.date_recrutement.split('T')[0] : ''
    })
    setShowModal(true)
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion des Professeurs</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} /> Ajouter
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">CIN</th>
              <th className="text-left py-3 px-4">Nom</th>
              <th className="text-left py-3 px-4">Prénom</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Département</th>
              <th className="text-left py-3 px-4">Modules</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfesseurs?.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{p.cin}</td>
                <td className="py-3 px-4">{p.nom}</td>
                <td className="py-3 px-4">{p.prenom}</td>
                <td className="py-3 px-4">{p.email}</td>
                <td className="py-3 px-4">{p.departement}</td>
                <td className="py-3 px-4">{p.modules?.length || 0}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!filteredProfesseurs || filteredProfesseurs.length === 0) && (
          <p className="text-center py-8 text-gray-500">
            {searchTerm ? 'Aucun professeur ne correspond à votre recherche' : 'Aucun professeur'}
          </p>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editingId ? 'Modifier' : 'Ajouter'} un Professeur`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Nom</label><input className="input" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Prénom</label><input className="input" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">CIN</label><input className="input" value={formData.cin} onChange={(e) => setFormData({...formData, cin: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Téléphone</label><input className="input" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Département</label><input className="input" value={formData.departement} onChange={(e) => setFormData({...formData, departement: e.target.value})} required /></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Date de recrutement</label><input type="date" className="input" value={formData.date_recrutement} onChange={(e) => setFormData({...formData, date_recrutement: e.target.value})} required /></div>
          <div className="col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
              {createMutation.isLoading || updateMutation.isLoading ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Supprimer le professeur" message="Êtes-vous sûr de vouloir supprimer ce professeur ?" />
    </div>
  )
}
