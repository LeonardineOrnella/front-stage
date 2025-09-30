"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/backoOffice/student/UserContext"

export default function RequireRole({ roles = [], children }) {
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (!user) return
    if (roles.length > 0 && !roles.includes(user.role)) {
      router.replace('/dasboard')
    }
  }, [user, roles, router])

  if (!roles.length) return <>{children}</>
  if (!user) return null
  if (!roles.includes(user.role)) return null
  return <>{children}</>
}


