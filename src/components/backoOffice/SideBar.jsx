"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, GraduationCap, Users, Layers, BookOpen, User, LogOut, } from "lucide-react"

export default function SideBar() {
  const pathname = usePathname()
  const user = JSON.parse(localStorage.getItem("user"));

  const links = [
    { href: "/dasboard", label: "Accueil", icon: LayoutDashboard },
    { href: "/dasboard/formation", label: "Mes Formations", icon: GraduationCap },
    ...(user?.role === "admin"
      ? [{ href: "/dasboard/categorie", label: "Catégories", icon: Layers }, { href: "/dasboard/formateur", label: "Formateurs", icon: Users }]
      : []),
    { href: "/dasboard/chapitre", label: "Chapitres", icon: BookOpen },
    { href: "/profil", label: "Profil", icon: User },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-500 text-white flex flex-col p-6 shadow-lg">
        {/* Logo */}
        <h1 className="text-3xl font-extrabold mb-10 tracking-wide">E-Learn</h1>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${pathname === href
                ? "bg-white text-emerald-600 font-semibold"
                : "hover:bg-emerald-600"
                }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Déconnexion */}
        <Link
          href="/logout"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </Link>
      </aside>
    </div>
  )
}
