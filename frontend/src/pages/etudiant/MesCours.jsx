import { useQuery } from 'react-query'
import api, { downloadFile } from '../../services/api'
import { FileText, Download, User, School } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MesCours() {
  const { data: cours, isLoading } = useQuery('etudiant-cours', () =>
    api.get('/etudiant/mes-cours').then((res) => res.data)
  )

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  const handleDownload = async (cour) => {
    try {
      const filename = `${cour.titre}.${cour.type_fichier}`
      await downloadFile(`/cours/${cour.id}/download`, filename)
    } catch (err) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Supports de Cours</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cours?.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg"><FileText size={20} className="text-blue-600" /></div>
              <h3 className="font-bold">{c.titre}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2"><User size={16} /> {c.professeur?.prenom} {c.professeur?.nom}</div>
              <div>Module: {c.module?.nom}</div>
              <div className="flex items-center gap-2"><School size={16} /> Classe: {c.classe?.nom || '—'}</div>
              <div className="uppercase">Format: {c.type_fichier}</div>
            </div>
            <button onClick={() => handleDownload(c)} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download size={18} /> Télécharger
            </button>
          </div>
        ))}
      </div>
      {(!cours || cours.length === 0) && <p className="text-center py-8 text-gray-500">Aucun cours disponible</p>}
    </div>
  )
}
