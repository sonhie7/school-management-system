import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function Etudiants() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('') // ✅ État pour la recherche
  
  const [formData, setFormData] = useState({
    cin: '', nom: '', prenom: '', sexe: 'M', date_naissance: '',
    telephone: '', email: '', adresse: '', filiere_id: '', classe_id: '', niveau: '', date_inscription: ''
  })

  const queryClient = useQueryClient()

  const { data: etudiants, isLoading } = useQuery('etudiants', () =>
    api.get('/admin/etudiants').then((res) => res.data)
  )

  const { data: filieres } = useQuery('filieres', () =>
    api.get('/admin/filieres').then((res) => res.data)
  )

  const { data: classes } = useQuery('classes', () =>
    api.get('/admin/classes').then((res) => res.data)
  )

  // ✅ FILTRAGE des étudiants selon la recherche
  const filteredEtudiants = etudiants?.filter((etudiant) => {
    const term = searchTerm.toLowerCase()
    return (
      etudiant.nom?.toLowerCase().includes(term) ||
      etudiant.prenom?.toLowerCase().includes(term) ||
      etudiant.cin?.toLowerCase().includes(term) ||
      etudiant.email?.toLowerCase().includes(term) ||
      etudiant.classe?.nom?.toLowerCase().includes(term) ||
      etudiant.filiere?.nom?.toLowerCase().includes(term)
    )
  })

  const createMutation = useMutation(
    (data) => api.post('/admin/etudiants', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('etudiants')
        setShowModal(false)
        resetForm()
        toast.success('Étudiant ajouté avec succès')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/etudiants/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('etudiants')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Étudiant modifié avec succès')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/etudiants/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('etudiants')
        setDeleteId(null)
        toast.success('Étudiant supprimé')
      }
    }
  )

  const resetForm = () => {
    setFormData({
      cin: '', nom: '', prenom: '', sexe: 'M', date_naissance: '',
      telephone: '', email: '', adresse: '', filiere_id: '', classe_id: '', niveau: '', date_inscription: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate({ ...formData, date_inscription: new Date().toISOString().split('T')[0] })
    }
  }

  const handleEdit = (etudiant) => {
    setEditingId(etudiant.id)
    setFormData({
      cin: etudiant.cin, nom: etudiant.nom, prenom: etudiant.prenom,
      sexe: etudiant.sexe,
      date_naissance: etudiant.date_naissance ? etudiant.date_naissance.split('T')[0] : '',
      telephone: etudiant.telephone, email: etudiant.email,
      adresse: etudiant.adresse, filiere_id: etudiant.filiere_id,
      classe_id: etudiant.classe_id, niveau: etudiant.niveau,
      date_inscription: etudiant.date_inscription ? etudiant.date_inscription.split('T')[0] : ''
    })
    setShowModal(true)
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      {/* Header avec recherche */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion des Étudiants</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* ✅ BARRE DE RECHERCHE */}
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
          
          <button 
            onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} 
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} /> Ajouter
          </button>
        </div>
      </div>

      {/* Compteur de résultats */}
      {searchTerm && (
        <p className="text-sm text-gray-500 mb-4">
          {filteredEtudiants?.length || 0} résultat(s) trouvé(s) sur {etudiants?.length || 0}
        </p>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">CIN</th>
              <th className="text-left py-3 px-4">Nom</th>
              <th className="text-left py-3 px-4">Prénom</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Filière</th>
              <th className="text-left py-3 px-4">Classe</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEtudiants?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Aucun étudiant ne correspond à votre recherche' : 'Aucun étudiant'}
                </td>
              </tr>
            ) : (
              filteredEtudiants?.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{e.cin}</td>
                  <td className="py-3 px-4">{e.nom}</td>
                  <td className="py-3 px-4">{e.prenom}</td>
                  <td className="py-3 px-4">{e.email}</td>
                  <td className="py-3 px-4">{e.filiere?.nom}</td>
                  <td className="py-3 px-4">{e.classe?.nom}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteId(e.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editingId ? 'Modifier' : 'Ajouter'} un Étudiant`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CIN</label>
              <input className="input" value={formData.cin} onChange={(e) => setFormData({...formData, cin: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sexe</label>
              <select className="input" value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input className="input" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input className="input" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de naissance</label>
              <input type="date" className="input" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input className="input" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Niveau</label>
              <input className="input" value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filière</label>
              <select className="input" value={formData.filiere_id} onChange={(e) => setFormData({...formData, filiere_id: e.target.value})} required>
                <option value="">Sélectionner</option>
                {filieres?.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Classe</label>
              <select className="input" value={formData.classe_id} onChange={(e) => setFormData({...formData, classe_id: e.target.value})} required>
                <option value="">Sélectionner</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <textarea className="input" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
              {createMutation.isLoading || updateMutation.isLoading ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Supprimer l'étudiant"
        message="Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible."
      />
    </div>
  )
}