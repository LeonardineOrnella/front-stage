"use client"
import { usePathname } from "next/navigation"
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Settings, 
  User, 
  LogOut,
  Menu,
  MessageSquare,
  HelpCircle,
  GraduationCap
} from "lucide-react"
import { useState } from "react"

export default function NavBar() {
  const pathname = usePathname()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  
  // Note: En production, remplacez par votre méthode de gestion d'état
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || '{}') : {}

  // Fonction pour obtenir le titre de la page
  const getPageTitle = () => {
    const routes = {
      '/dasboard': 'Tableau de Bord',
      '/dasboard/formation': 'Mes Formations',
      '/dasboard/categorie': 'Gestion des Catégories',
      '/dasboard/formateur': 'Gestion des Formateurs',
      '/dasboard/chapitre': 'Gestion des Chapitres',
      '/profil': 'Mon Profil',
      '/settings': 'Paramètres'
    }
    return routes[pathname] || 'E-Learn Platform'
  }

  const notifications = [
    { id: 1, message: "Nouveau cours disponible", time: "Il y a 2 min", unread: true },
    { id: 2, message: "Votre formation se termine bientôt", time: "Il y a 1h", unread: true },
    { id: 3, message: "Certificat prêt à télécharger", time: "Il y a 3h", unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section - Page title and breadcrumb */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 text-emerald-600">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <GraduationCap className="w-4 h-4" />
            <span>E-Learn</span>
            <span className="text-emerald-300">/</span>
            <span className="text-emerald-800 font-medium">{getPageTitle()}</span>
          </div>
        </div>

        {/* Center - Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher des formations, chapitres..."
              className="w-full pl-10 pr-4 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-emerald-400 text-emerald-900"
            />
          </div>
        </div>

        {/* Right section - Actions and profile */}
        <div className="flex items-center gap-3">
          {/* Search button for mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-emerald-50 text-emerald-600">
            <Search className="w-5 h-5" />
          </button>

          {/* Help button */}
          <button className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Messages button */}
          <button className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Notifications dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-emerald-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-emerald-100">
                  <h3 className="font-semibold text-emerald-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-emerald-50 transition-colors border-l-2 ${
                        notification.unread ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent'
                      }`}
                    >
                      <p className="text-sm text-emerald-800 font-medium">{notification.message}</p>
                      <p className="text-xs text-emerald-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-emerald-100">
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-emerald-800">
                  {user?.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-emerald-500">
                  {user?.role === 'admin' ? 'Administrateur' : 'Étudiant'}
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
                  <p className="font-semibold text-emerald-800">{user?.name || 'Utilisateur'}</p>
                  <p className="text-xs text-emerald-500">{user?.email || 'email@example.com'}</p>
                </div>
                
                <div className="py-2">
                  <a
                    href="/profil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mon Profil
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
                    Se déconnecter
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
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-emerald-400 text-emerald-900"
          />
        </div>
      </div>

      {/* Click outside handlers */}
      {(isProfileOpen || isNotificationOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setIsProfileOpen(false)
            setIsNotificationOpen(false)
          }}
        />
      )}
    </header>
  )
}