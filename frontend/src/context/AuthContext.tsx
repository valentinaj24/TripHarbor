
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  getCurrentUser,
  type AuthUser,
  type AuthResponse,
} from '../services/api'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (response: AuthResponse) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      const token = sessionStorage.getItem('tripharbor_token')

      if (!token) {
        if (active) setLoading(false)
        return
      }

      try {
        const response = await getCurrentUser(token)

        if (active) {
          setUser(response.user)
          sessionStorage.setItem(
            'tripharbor_user',
            JSON.stringify(response.user)
          )
        }
      } catch {
        if (active) {
          sessionStorage.removeItem('tripharbor_token')
          sessionStorage.removeItem('tripharbor_user')
          setUser(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void restoreSession()

    return () => {
      active = false
    }
  }, [])

  function signIn(response: AuthResponse) {
    sessionStorage.setItem('tripharbor_token', response.token)
    sessionStorage.setItem(
      'tripharbor_user',
      JSON.stringify(response.user)
    )
    setUser(response.user)
  }

  function signOut() {
    sessionStorage.removeItem('tripharbor_token')
    sessionStorage.removeItem('tripharbor_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
