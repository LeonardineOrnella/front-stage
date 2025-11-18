"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/components/backoOffice/student/UserContext"
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Settings,
  Bell,
  Shield,
  BarChart3,
  CreditCard,
  ChevronRight,
  User as UserIcon,
  RadioTower,
  ListChecks,
  Trophy,
  MessageCircle,
  Users,
  Layers
} from "lucide-react"

export default function SideBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useUser() || {}
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    try {
      setShowLogoutModal(false)
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax"
      }
      if (typeof setUser === "function") {
        setUser(null)
      }
      router.push("/connexion")
      router.refresh?.()
    } catch (error) {
      // No-op: best-effort logout
    }
  }

  const mainLinks = [
    { href: "/dasboard", label: "Accueil", icon: LayoutDashboard },
    { href: "/dasboard/notifications", label: "Notifications", icon: Bell }
  ]

  const accountLinks = [
    { href: "/profil", label: "Mon Profil", icon: UserIcon },
    { href: "/settings", label: "Paramètres", icon: Settings }
  ]

  const adminLinks = [
    { href: "/dasboard/utilisateurs", label: "Utilisateurs", icon: Users },
    { href: "/dasboard/formation", label: "Formations", icon: GraduationCap },
    { href: "/dasboard/categorie", label: "Catégories", icon: Layers },
    { href: "/dasboard/formateur", label: "Formateurs", icon: Users },
    { href: "/dasboard/statistiques", label: "Statistiques", icon: BarChart3 },
    { href: "/dasboard/paiements", label: "Paiements", icon: CreditCard },
  ]

  const formateurLinks = [
    { href: "/dasboard/formation", label: "Formations", icon: GraduationCap },
    { href: "/dasboard/formateur/lives", label: "Lives", icon: RadioTower },
    { href: "/dasboard/formateur/quiz", label: "Quiz", icon: ListChecks },
    { href: "/dasboard/formateur/progression", label: "Progression", icon: BarChart3 },
    { href: "/dasboard/formateur/resultats", label: "Résultats", icon: Trophy }
  ]

  const apprenantLinks = [
    { href: "/dasboard/apprenant", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dasboard/apprenant/catalogue", label: "Catalogue", icon: GraduationCap },
    { href: "/dasboard/apprenant/mesCours", label: "Mes Cours", icon: BookOpen },
    { href: "/dasboard/apprenant/transactions", label: "Transactions", icon: CreditCard },
    { href: "/dasboard/apprenant/quiz", label: "Quiz", icon: ListChecks },
    { href: "/dasboard/apprenant/discussions", label: "Discussions", icon: MessageCircle },
    { href: "/dasboard/apprenant/certificats", label: "Certificats", icon: Shield }
  ]

  const renderLink = ({ href, label, icon: Icon }) => {
    const isActive = pathname === href
    return (
      <Link
        key={href}
        href={href}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
          isActive
            ? "bg-white text-emerald-600 font-semibold shadow-lg transform scale-[1.02]"
            : "text-emerald-100 hover:bg-emerald-700/40 hover:text-white"
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
        <span className="font-medium">{label}</span>
        {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-80" />}
        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </Link>
    )
  }

  return (
    <aside className="w-full h-screen bg-emerald-500 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center p-4 flex-shrink-0">
        <Image
          src="/UN-IT_Academy_1000x500.png"
          alt="UN-IT Academy"
          width={160}
          height={50}
          priority
          className="h-auto w-auto max-w-[200px]"
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Menu principal */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
            Menu principal
          </h3>
          {mainLinks.map(renderLink)}
        </div>

        {/* Administration / Formateur / Apprenant */}
        {user?.role === "admin" && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
              Administration
            </h3>
            {adminLinks.map(renderLink)}
          </div>
        )}
        {user?.role === "formateur" && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
              Gestion Formateur
            </h3>
            {formateurLinks.map(renderLink)}
          </div>
        )}
        {user?.role === "apprenant" && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
              Apprentissage
            </h3>
            {apprenantLinks.map(renderLink)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-emerald-700 p-4 flex-shrink-0">
        <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
          Compte
        </h3>
        {accountLinks.map(renderLink)}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-4 w-full text-left group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-emerald-100 hover:bg-emerald-700/40 hover:text-white"
        >
          <Shield className="w-5 h-5" />
          <span className="font-medium">Se déconnecter</span>
        </button>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
            <h4 className="text-lg font-semibold text-emerald-800 mb-2">
              Se déconnecter ?
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre espace.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
