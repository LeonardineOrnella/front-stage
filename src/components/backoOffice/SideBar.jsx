"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Layers, 
  BookOpen, 
  User, 
  LogOut,
  ChevronRight,
  Settings,
  Bell,
  FileText,
  Shield
} from "lucide-react"

export default function SideBar() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Note: En production, remplacez par votre méthode de gestion d'état
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || '{}') : {}

  const handleLogout = () => {
    try {
      // Clear client storages
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Delete token cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax"
      }
    } catch (e) {
      // no-op
    }
    router.push('/')
  }

  const links = [
    { href: "/dasboard", label: "Accueil", icon: LayoutDashboard, category: "main" },
    { href: "/dasboard/formation", label: "Formations", icon: GraduationCap, category: "main" },
    { href: "/dasboard/chapitre", label: "Chapitres", icon: BookOpen, category: "main" },
    { href: "/dasboard/profil", label: "Mon Profil", icon: User, category: "main" },
  ]

     // Liens spécifiques aux admins
   const adminLinks = [
     { href: "/dasboard/categorie", label: "Catégories", icon: Layers, category: "admin" },
     { href: "/dasboard/formateur", label: "Formateurs", icon: Users, category: "admin" },
     { href: "/dasboard/utilisateurs", label: "Utilisateurs", icon: User, category: "admin" },
     { href: "/dasboard/test-roles", label: "Test Rôles", icon: Shield, category: "admin" },
     { href: "/dasboard/test-simple", label: "Test Simple", icon: Shield, category: "admin" },
   ]

  // Liens spécifiques aux formateurs
  const formateurLinks = [
    { href: "/dasboard/mes-formations", label: "Mes Formations", icon: BookOpen, category: "formateur" },
    { href: "/dasboard/ressources", label: "Mes Ressources", icon: FileText, category: "formateur" },
  ]

  // Liens spécifiques aux apprenants
  const apprenantLinks = [
    { href: "/dasboard/apprenant/catalogue", label: "Catalogue", icon: GraduationCap, category: "apprenant" },
    { href: "/dasboard/apprenant/mes-cours", label: "Mes Cours", icon: BookOpen, category: "apprenant" },
  ]

  const profileLinks = [
    { href: "/settings", label: "Paramètres", icon: Settings },
  ]

  return (
    <aside className="w-72 bg-emerald-600 text-white flex flex-col shadow-2xl border-r border-emerald-700/30 h-screen">
      {/* Header avec logo */}
      <div className="p-6 border-b border-emerald-700/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg border border-emerald-400/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            E-Learn
          </h1>
        </div>
        
                 {/* User info */}
         <div className="flex items-center gap-3 p-3 bg-emerald-700/30 rounded-xl backdrop-blur-sm border border-emerald-600/30">
           <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
             <span className="text-sm font-semibold text-white">
               {user?.nom?.charAt(0)?.toUpperCase() || user?.prenom?.charAt(0)?.toUpperCase() || 'U'}
             </span>
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-sm font-medium text-white truncate">
               {user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : user?.nom || user?.prenom || 'Utilisateur'}
             </p>
             <p className="text-xs text-emerald-200 truncate">
               {user?.role === 'admin' ? 'Administrateur' : 
                user?.role === 'formateur' ? 'Formateur' : 
                user?.role === 'apprenant' ? 'Apprenant' : 'Utilisateur'}
             </p>
           </div>
           <Bell className="w-4 h-4 text-emerald-300" />
         </div>
      </div>

      {/* Navigation principale - scrollable si nécessaire */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Section principale */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
            Navigation
          </h3>
          {links.filter(link => link.category === "main").map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                pathname === href
                  ? "bg-white text-emerald-600 font-semibold shadow-lg transform scale-[1.02]"
                  : "text-emerald-100 hover:bg-emerald-700/40 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${
                pathname === href ? "scale-110" : "group-hover:scale-105"
              }`} />
              <span className="font-medium">{label}</span>
              {pathname === href && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
              )}
              
              {/* Effet de survol */}
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </Link>
          ))}
        </div>

        {/* Section admin */}
        {user?.role === "admin" && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
              Administration
            </h3>
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  pathname === href
                    ? "bg-white text-emerald-600 font-semibold shadow-lg transform scale-[1.02]"
                    : "text-emerald-100 hover:bg-emerald-700/40 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  pathname === href ? "scale-110" : "group-hover:scale-105"
                }`} />
                <span className="font-medium">{label}</span>
                {pathname === href && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
                )}
                
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
            ))}
          </div>
        )}

        {/* Section formateur */}
        {user?.role === "formateur" && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
              Gestion Formateur
            </h3>
            {formateurLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  pathname === href
                    ? "bg-white text-emerald-600 font-semibold shadow-lg transform scale-[1.02]"
                    : "text-emerald-100 hover:bg-emerald-700/40 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  pathname === href ? "scale-110" : "group-hover:scale-105"
                }`} />
                <span className="font-medium">{label}</span>
                {pathname === href && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
                )}
                
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
            ))}
          </div>
        )}

        {/* Section apprenant */}
        {user?.role === "apprenant" && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
              Apprentissage
            </h3>
            {apprenantLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  pathname === href
                    ? "bg-white text-emerald-600 font-semibold shadow-lg transform scale-[1.02]"
                    : "text-emerald-100 hover:bg-emerald-700/40 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  pathname === href ? "scale-110" : "group-hover:scale-105"
                }`} />
                <span className="font-medium">{label}</span>
                {pathname === href && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
                )}
                
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
            ))}
          </div>
        )}

        {/* Section profil */}
        <div>
          <h3 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3 px-2">
            Compte
          </h3>
          {profileLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                pathname === href
                  ? "bg-white text-emerald-600 font-semibold shadow-lg transform scale-[1.02]"
                  : "text-emerald-100 hover:bg-emerald-700/40 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${
                pathname === href ? "scale-110" : "group-hover:scale-105"
              }`} />
              <span className="font-medium">{label}</span>
              {pathname === href && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
              )}
              
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer avec déconnexion */}
      <div className="p-4 border-t border-emerald-700/30 flex-shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-emerald-100 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-500/30"
        >
          <LogOut className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" />
          <span className="font-medium">Déconnexion</span>
          <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0" />
        </button>
        
        {/* Version info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-emerald-300">Version 2.1.0</p>
        </div>
      </div>

      {/* Décoration gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
    </aside>
  )
}