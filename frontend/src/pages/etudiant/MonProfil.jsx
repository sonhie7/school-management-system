import { useQuery } from 'react-query'
import api from '../../services/api'
import { User, Phone, MapPin, GraduationCap, School, Calendar } from 'lucide-react'

export default function MonProfil() {
  const { data: profil, isLoading } = useQuery('mon-profil', () =>
    api.get('/etudiant/profil').then((res) => res.data)
  )

  if (isLoading) return <div className="text-center py-8">Chargement...</div>

  // Debug: log the profile data
  console.log('Profil data:', profil)

  // Format date from ISO string to readable French date
  const formatDate = (isoDate) => {
    if (!isoDate) return '—'
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // If no profile data, show error
  if (!profil) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        <div className="card max-w-2xl text-center py-8 text-gray-500">
          Impossible de charger votre profil. Veuillez vous reconnecter.
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      <div className="card max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={40} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profil.prenom || '—'} {profil.nom || '—'}</h2>
            <p className="text-gray-500">{profil.email || '—'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <GraduationCap size={20} className="text-primary-600" />
            <div><p className="text-sm text-gray-500">Filière</p><p className="font-medium">{profil.filiere?.nom || '—'}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <School size={20} className="text-primary-600" />
            <div><p className="text-sm text-gray-500">Classe</p><p className="font-medium">{profil.classe?.nom || '—'}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone size={20} className="text-primary-600" />
            <div><p className="text-sm text-gray-500">Téléphone</p><p className="font-medium">{profil.telephone || '—'}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin size={20} className="text-primary-600" />
            <div><p className="text-sm text-gray-500">Adresse</p><p className="font-medium">{profil.adresse || '—'}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar size={20} className="text-primary-600" />
            <div><p className="text-sm text-gray-500">Date de naissance</p><p className="font-medium">{formatDate(profil.date_naissance)}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User size={20} className="text-primary-600" />
            <div><p className="text-sm text-gray-500">CIN</p><p className="font-medium">{profil.cin || '—'}</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
