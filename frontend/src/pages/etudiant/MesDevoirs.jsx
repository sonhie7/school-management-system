import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { downloadFile } from '../../services/api'
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Download, Send } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

export default function MesDevoirs() {
  const [submitDevoir, setSubmitDevoir] = useState(null)
  const [fichier, setFichier] = useState(null)
  const [commentaire, setCommentaire] = useState('')

  const queryClient = useQueryClient()

  const { data: devoirs, isLoading } = useQuery('mes-devoirs', () =>
    api.get('/etudiant/mes-devoirs').then((res) => res.data)
  )

  const submitMutation = useMutation(
    async ({ devoirId, data }) => {
      return api.post(`/devoirs/${devoirId}/soumettre`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mes-devoirs')
        setSubmitDevoir(null)
        setFichier(null)
        setCommentaire('')
        toast.success('Devoir soumis avec succès')
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Erreur lors de la soumission')
      }
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fichier) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }
    const data = new FormData()
    data.append('fichier', fichier)
    if (commentaire) data.append('commentaire', commentaire)
    submitMutation.mutate({ devoirId: submitDevoir.id, data })
  }

  const isDeadlinePassed = (dateLimite) => {
    return new Date() > new Date(dateLimite)
  }

  const getDeadlineStatus = (dateLimite) => {
    const now = new Date()
    const deadline = new Date(dateLimite)
    const diff = deadline - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (diff < 0) return { label: 'Date limite dépassée', color: 'text-red-600', icon: AlertCircle }
    if (days <= 1) return { label: `${days} jour restant`, color: 'text-red-600', icon: AlertCircle }
    if (days <= 3) return { label: `${days} jours restants`, color: 'text-orange-600', icon: Clock }
    return { label: `${days} jours restants`, color: 'text-green-600', icon: Clock }
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Devoirs</h1>

      {devoirs?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucun devoir assigné pour le moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devoirs?.map((d) => {
            const status = getDeadlineStatus(d.date_limite)
            const passed = isDeadlinePassed(d.date_limite)
            const StatusIcon = status.icon

            return (
              <div key={d.id} className={`card ${passed ? 'opacity-75' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    d.type === 'TP' ? 'bg-blue-100 text-blue-700' :
                    d.type === 'Projet' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{d.type}</span>
                  {d.soumis ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={16} /> Soumis
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 text-sm font-medium ${status.color}`}>
                      <StatusIcon size={16} /> {status.label}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2">{d.titre}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{d.description}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Module: {d.module?.nom}</div>
                  <div>Classe: {d.classe?.nom || 'Toutes les classes'}</div>
                  <div>Professeur: {d.professeur?.prenom} {d.professeur?.nom}</div>
                  <div>Date limite: {new Date(d.date_limite).toLocaleDateString('fr-FR')}</div>
                  {d.fichier && (
                    <button
                      onClick={() => downloadFile(`/devoirs/${d.id}/download`, d.fichier)}
                      className="flex items-center gap-1 text-blue-600 hover:underline mt-1"
                    >
                      <Download size={14} /> Télécharger le sujet
                    </button>
                  )}
                </div>
                {!d.soumis && !passed && (
                  <button
                    onClick={() => setSubmitDevoir(d)}
                    className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Upload size={16} /> Soumettre
                  </button>
                )}
                {d.soumis && (
                  <div className="mt-4 text-center text-sm text-green-600 font-medium py-2 bg-green-50 rounded">
                    Vous avez déjà soumis ce devoir
                  </div>
                )}
                {passed && !d.soumis && (
                  <div className="mt-4 text-center text-sm text-red-600 font-medium py-2 bg-red-50 rounded">
                    Date limite dépassée
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Submit Modal */}
      <Modal isOpen={!!submitDevoir} onClose={() => { setSubmitDevoir(null); setFichier(null); setCommentaire('') }} title={`Soumettre : ${submitDevoir?.titre}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fichier (PDF, DOC, DOCX, ZIP, RAR - max 10MB)</label>
            <input
              type="file"
              className="input py-1"
              accept=".pdf,.doc,.docx,.zip,.rar"
              onChange={(e) => setFichier(e.target.files[0])}
              required
            />
            {fichier && <p className="text-sm text-gray-500 mt-1">{fichier.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Commentaire (optionnel)</label>
            <textarea
              className="input"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              placeholder="Ajoutez un commentaire..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setSubmitDevoir(null); setFichier(null); setCommentaire('') }} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={submitMutation.isLoading}>
              <Send size={16} /> {submitMutation.isLoading ? 'Envoi...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
