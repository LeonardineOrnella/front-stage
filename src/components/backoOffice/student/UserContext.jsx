"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { userService } from "@/service/user.service"

const UserContext = createContext({ user: null, setUser: () => {} })

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      
      if (!token || !storedUser) {
        return
      }

      // Si l'utilisateur est déjà en localStorage, l'utiliser d'abord
      try {
        const parsedUser = JSON.parse(storedUser)
        if (mounted) setUser(parsedUser)
      } catch (e) {
        console.error('Erreur parsing user localStorage:', e)
      }

      // Ensuite, vérifier avec le backend
      userService.getMe()
        .then(res => { 
          if (mounted && res.data) {
            setUser(res.data)
            // Mettre à jour localStorage avec les données fraîches du backend
            localStorage.setItem('user', JSON.stringify(res.data))
          }
        })
        .catch(err => {
          console.error('Erreur getMe:', err?.response?.status, err?.message)
          // Si 401 ou 403, le token est expiré
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            if (mounted) {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setUser(null)
            }
          }
        })
    } catch (e) {
      console.error('Erreur UserProvider:', e)
    }
    return () => { mounted = false }
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}



