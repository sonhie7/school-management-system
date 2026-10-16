import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { downloadFile } from '../../services/api'
import { Plus, FileText, Trash2, Upload, Pencil, Users, Download } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const typesDevoir = [
  { value: 'TP', label: 'TP' },
  { value: 'Projet', label: 'Projet' },
  { value: 'Devoir_maison', label: 'Devoir Maison' },
]

export default function Devoirs() {
  const [showModal, setShowModal] = useState(false)
  const [showSubmissions, setShowSubmissions] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    titre: '', description: '', type: 'TP', module_id: '', classe_id: '', date_limite: '', fichier: null
  })

  const queryClient = useQueryClient()

  const { data: devoirs, isLoading } = useQuery('devoirs', () =>
    api.get('/professeur/devoirs').then((res) => res.data)
  )

  const { data: modules } = useQuery('prof-modules', () =>
    api.get('/professeur/mes-modules').then((res) => res.data)
  )

  const { data: classes } = useQuery('prof-classes', () =>
    api.get('/professeur/mes-classes').then((res) => res.data)
  )

  const { data: soumissions, isLoading: loadingSoumissions } = useQuery(
    ['soumissions', showSubmissions],
    () => api.get(`/professeur/devoirs/${showSubmissions}/soumissions`).then((res) => res.data),
    { enabled: !!showSubmissions }
  )

  const createMutation = useMutation(
    async (data) => {
      return api.post('/professeur/devoirs', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devoirs')
        setShowModal(false)
        resetForm()
        toast.success('Devoir créé avec succès')
      }
    }
  )

  const updateMutation = useMutation(
    async ({ id, data }) => {
      return api.post(`/professeur/devoirs/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devoirs')
        setShowModal(false)
        setEditingId(null)
        resetForm()
        toast.success('Devoir mis à jour')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/professeur/devoirs/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devoirs')
        setDeleteId(null)
        toast.success('Devoir supprimé')
      }
    }
  )

  const resetForm = () => {
    setFormData({ titre: '', description: '', type: 'TP', module_id: '', classe_id: '', date_limite: '', fichier: null })
  }

  const handleEdit = (devoir) => {
    setEditingId(devoir.id)
    setFormData({
      titre: devoir.titre,
      description: devoir.description,
      type: devoir.type,
      module_id: devoir.module_id,
      classe_id: devoir.classe_id || '',
      date_limite: devoir.date_limite.split('T')[0],
      fichier: null
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('titre', formData.titre)
    data.append('description', formData.description)
    data.append('type', formData.type)
    data.append('module_id', formData.module_id)
    if (formData.classe_id) data.append('classe_id', formData.classe_id)
    data.append('date_limite', formData.date_limite)
    if (formData.fichier) data.append('fichier', formData.fichier)

    if (editingId) {
      data.append('_method', 'PUT')
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDownload = (devoir) => {
    if (devoir.fichier) {
      downloadFile(`/devoirs/${devoir.id}/download`, devoir.fichier)
    }
  }

  const handleDownloadSubmission = (soumission) => {
    downloadFile(`/soumissions/${soumission.id}/download`, soumission.fichier)
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Devoirs</h1>
        <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Créer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devoirs?.map((d) => (
          <div key={d.id} className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowSubmissions(d.id)}>
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                d.type === 'TP' ? 'bg-blue-100 text-blue-700' :
                d.type === 'Projet' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>{d.type}</span>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(d) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(d.id) }} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">{d.titre}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{d.description}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <div>Module: {d.module?.nom}</div>
              <div>Classe: {d.classe?.nom || 'Toutes les classes'}</div>
              <div>Date limite: {new Date(d.date_limite).toLocaleDateString('fr-FR')}</div>
              {d.fichier && (
                <div className="flex items-center gap-1 text-blue-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDownload(d) }}>
                  <FileText size={14} /> Pièce jointe
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <Users size={14} />
              <span>{d.soumissions?.length || 0} soumission(s)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Modifier le Devoir' : 'Créer un Devoir'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Titre</label><input className="input" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Type</label><select className="input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>{typesDevoir.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Module</label><select className="input" value={formData.module_id} onChange={(e) => setFormData({...formData, module_id: e.target.value})} required><option value="">Sélectionner</option>{modules?.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Classe</label><select className="input" value={formData.classe_id} onChange={(e) => setFormData({...formData, classe_id: e.target.value})}><option value="">Toutes les classes</option>{classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Date Limite</label><input type="date" className="input" value={formData.date_limite} onChange={(e) => setFormData({...formData, date_limite: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Fichier {editingId ? '(remplacer)' : '(optionnel)'}</label><input type="file" className="input py-1" onChange={(e) => setFormData({...formData, fichier: e.target.files[0]})} /></div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{editingId ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal isOpen={!!showSubmissions} onClose={() => setShowSubmissions(null)} title="Soumissions des Étudiants">
        {loadingSoumissions ? (
          <div className="text-center py-8">Chargement...</div>
        ) : soumissions?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucune soumission pour ce devoir.</div>
        ) : (
          <div className="space-y-3">
            {soumissions?.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{s.etudiant?.prenom} {s.etudiant?.nom}</div>
                  <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString('fr-FR')} à {new Date(s.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                  {s.commentaire && <div className="text-sm text-gray-600 mt-1">{s.commentaire}</div>}
                </div>
                <button onClick={() => handleDownloadSubmission(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Télécharger">
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Supprimer le devoir" message="Êtes-vous sûr de vouloir supprimer ce devoir ?" />
    </div>
  )
}
