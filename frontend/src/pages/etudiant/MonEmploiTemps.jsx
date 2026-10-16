import { useQuery } from 'react-query'
import api, { downloadFile } from '../../services/api'
import { FileDown } from 'lucide-react'
import toast from 'react-hot-toast'

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function MonEmploiTemps() {
  const { data: emplois, isLoading } = useQuery('etudiant-emploi', () =>
    api.get('/etudiant/mon-emploi-temps').then((res) => res.data)
  )

  const handleDownloadPdf = async () => {
    try {
      const res = await api.get('/etudiant/profil')
      const classeId = res.data.classe_id
      if (classeId) {
        await downloadFile(`/emplois-temps/${classeId}/pdf`, `emploi-temps-${res.data.classe?.nom || 'classe'}.pdf`)
      } else {
        toast.error('Classe non trouvée')
      }
    } catch (err) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mon Emploi du Temps</h1>
        <button
          onClick={handleDownloadPdf}
          className="btn-primary flex items-center gap-2"
        >
          <FileDown size={18} /> Télécharger PDF
        </button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Jour</th>
              <th className="text-left py-3 px-4">Heure</th>
              <th className="text-left py-3 px-4">Module</th>
              <th className="text-left py-3 px-4">Professeur</th>
              <th className="text-left py-3 px-4">Salle</th>
            </tr>
          </thead>
          <tbody>
            {jours.map(jour => {
              const seances = emplois?.filter(e => e.jour === jour) || []
              return seances.length > 0 ? seances.map((e, i) => (
                <tr key={`${jour}-${i}`} className="border-b hover:bg-gray-50">
                  {i === 0 && <td className="py-3 px-4 font-medium" rowSpan={seances.length}>{jour}</td>}
                  <td className="py-3 px-4">{e.heure_debut} - {e.heure_fin}</td>
                  <td className="py-3 px-4">{e.module?.nom}</td>
                  <td className="py-3 px-4">{e.professeur?.prenom} {e.professeur?.nom}</td>
                  <td className="py-3 px-4">{e.salle}</td>
                </tr>
              )) : (
                <tr key={jour} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{jour}</td>
                  <td colSpan={4} className="py-3 px-4 text-gray-400">Aucune séance</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
