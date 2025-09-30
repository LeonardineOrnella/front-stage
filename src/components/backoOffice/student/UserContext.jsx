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
      if (!token) return
      userService.getMe()
        .then(res => { if (mounted) setUser(res.data) })
        .catch(() => { /* ignorer 401/403 */ })
    } catch {}
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



