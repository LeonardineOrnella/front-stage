"use client"
import { usePathname, useRouter } from "next/navigation"
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Settings, 
  User, 
  LogOut,
  Menu,
  HelpCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@/components/backoOffice/student/UserContext"
import { messageService } from "@/service/message.service"

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Note: En production, remplacez par votre méthode de gestion d'état
  const { user: profile } = useUser()

  // Charger le nombre de notifications non lues
  const loadUnreadNotifications = async () => {
    try {
      const response = await messageService.getUnreadMessages()
      const unreadMessages = response.data?.data || response.data || []
      setUnreadCount(unreadMessages.length)
    } catch (error) {
      console.error('Erreur lors du chargement des notifications non lues:', error)
      setUnreadCount(0)
    }
  }

  // Charger les notifications non lues au montage et périodiquement
  useEffect(() => {
    loadUnreadNotifications()
    
    // Recharger toutes les 30 secondes
    const interval = setInterval(() => {
      loadUnreadNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Recharger quand on revient sur la page de notifications
  useEffect(() => {
    if (pathname === '/dasboard/notifications') {
      loadUnreadNotifications()
    }
  }, [pathname])

  const displayName = profile?.nom ? `${profile.nom}${profile.prenom ? ' ' + profile.prenom : ''}` : (profile?.name || 'Utilisateur')
  const roleLabel = profile?.role === 'admin' ? 'Administrateur' : (profile?.role === 'formateur' ? 'Formateur' : 'Apprenant')
  const photoUrl = profile?.photo ? `http://localhost:3001${profile.photo}` : null

  // Fonction pour obtenir le titre de la page
  const getPageTitle = () => {
    const routes = {
      '/dasboard': 'Tableau de bord',
      '/dasboard/formation': 'Mes formations',
      '/dasboard/categorie': 'Catégories',
      '/dasboard/formateur': 'Formateurs',
      '/dasboard/chapitre': 'Chapitres',
      '/profil': 'Profil',
      '/settings': 'Paramètres'
    }
    return routes[pathname] || 'UN-IT'
  }

  return (
    <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section - Menu + Search */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 text-emerald-600">
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
              <input
                type="text"
                placeholder={'Rechercher une formation...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    try { sessionStorage.setItem('globalSearch', searchQuery || '') } catch {}
                    router.push('/dasboard/apprenant/catalogue')
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-emerald-400 text-emerald-900"
              />
            </div>
          </div>
        </div>


        {/* Right section - Actions and profile */}
        <div className="flex items-center gap-3">
          {/* Search button for mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-emerald-50 text-emerald-600">
            <Search className="w-5 h-5" />
          </button>

          {/* Help button */}
          <button className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title={'Aide'}>
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications button - redirects to notifications page */}
          <button
            onClick={() => {
              router.push('/dasboard/notifications')
              // Recharger les notifications après la navigation
              setTimeout(() => loadUnreadNotifications(), 500)
            }}
            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && pathname !== '/dasboard/notifications' && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profil" className="w-8 h-8 rounded-full object-cover shadow-md" />
              ) : (
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-semibold text-white">
                    {(profile?.nom?.[0] || profile?.name?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-emerald-800">
                  {displayName}
                </p>
                <p className="text-xs text-emerald-500">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-emerald-600 transition-transform ${
                isProfileOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Profile dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-emerald-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-emerald-100">
                  <p className="font-semibold text-emerald-800">{displayName}</p>
                  <p className="text-xs text-emerald-500">{profile?.email || 'email@example.com'}</p>
                </div>
                
                <div className="py-2">
                  <a
                    href="/dasboard/profil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mon profil
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </a>
                </div>

                <div className="border-t border-emerald-100 py-2">
                  <button
                    onClick={() => {
                      // Logique de déconnexion
                      try {
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('token')
                          localStorage.removeItem('user')
                          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax"
                          // Rediriger vers la page de connexion
                          window.location.href = '/connexion'
                        }
                      } catch (e) {
                        // no-op
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
          <input
            type="text"
            placeholder={'Rechercher une formation...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  try { sessionStorage.setItem('globalSearch', searchQuery || '') } catch {}
                  router.push('/dasboard/apprenant/catalogue')
                }
              }}
            className="w-full pl-10 pr-4 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-emerald-400 text-emerald-900"
          />
        </div>
      </div>

      {/* Click outside handlers */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setIsProfileOpen(false)
          }}
        />
      )}
    </header>
  )
}