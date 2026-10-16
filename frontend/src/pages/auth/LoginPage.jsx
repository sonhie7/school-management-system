import { useState } from 'react'
import { useMutation } from 'react-query'
import { useAuthStore } from '../../context/authStore'
import api from '../../services/api'
import { Lock, Mail, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)

  const loginMutation = useMutation(
    async (credentials) => {
      const response = await api.post('/login', credentials)
      return response.data
    },
    {
      onSuccess: (data) => {
        setAuth(data)
        toast.success('Connexion réussie !')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur de connexion')
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <GraduationCap size={32} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 mt-1">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="admin@school.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loginMutation.isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">Comptes de démo :</p>
            <ul className="space-y-1 text-xs">
              <li><strong>Admin:</strong> admin@school.com / admin123</li>
              <li><strong>Prof:</strong> prof1@school.com / AB123456</li>
              <li><strong>Étudiant:</strong> (créé par le seeder)</li>
            </ul>
          </div>
        )} */}
      </div>
    </div>
  )
}
