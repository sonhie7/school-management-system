import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Helper to check if token is expired (Sanctum tokens don't have exp, but we can track creation time)
const isTokenExpired = (timestamp) => {
  if (!timestamp) return true
  // Token valid for 24 hours (adjust as needed)
  const TOKEN_LIFETIME = 24 * 60 * 60 * 1000
  return Date.now() - timestamp > TOKEN_LIFETIME
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      profile: null,
      tokenCreatedAt: null,

      setAuth: (data) => set({
        user: data.user,
        token: data.token,
        profile: data.profile,
        tokenCreatedAt: Date.now(),
      }),

      logout: () => {
        set({ user: null, token: null, profile: null, tokenCreatedAt: null })
      },

      getToken: () => get().token,

      isTokenValid: () => {
        const { token, tokenCreatedAt } = get()
        if (!token) return false
        return !isTokenExpired(tokenCreatedAt)
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
