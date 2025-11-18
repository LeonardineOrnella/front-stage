"use client"
import { useEffect, useMemo, useState } from "react"
import api from "@/lib/axios"
import { toast } from "react-toastify"
import { useUser } from "@/components/backoOffice/student/UserContext"

// Mapping entre les champs UI et les clés de paramètre côté API
const SETTINGS_KEYS = {
  siteName: "site_name",
  contactEmail: "contact_email",
  theme: "theme",
  itemsPerPage: "items_per_page",
  enableNotifications: "enable_notifications",
}

export default function Page() {
  const { user } = useUser()
  const role = user?.role || "apprenant"

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([]) // lignes brutes depuis /settings
  const [form, setForm] = useState({
    siteName: "E-Learn",
    contactEmail: "",
    theme: "light",
    itemsPerPage: 10,
    enableNotifications: true,
  })

  // index par clé -> ligne complète { id_param, cle, valeur }
  const keyIndex = useMemo(() => {
    const map = {}
    for (const r of records || []) map[r.cle] = r
    return map
  }, [records])

  const applyThemeLocally = (mode) => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem('theme', mode)
      if (mode === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch {}
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/settings')
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])
        setRecords(list)

        const getVal = (key, fallback) => {
          const row = list.find(r => r.cle === key)
          return row?.valeur ?? fallback
        }
        const next = {
          siteName: String(getVal(SETTINGS_KEYS.siteName, 'E-Learn')),
          contactEmail: String(getVal(SETTINGS_KEYS.contactEmail, '')),
          theme: String(getVal(SETTINGS_KEYS.theme, 'light')),
          itemsPerPage: Number(getVal(SETTINGS_KEYS.itemsPerPage, 10)) || 10,
          enableNotifications: String(getVal(SETTINGS_KEYS.enableNotifications, 'true')) !== 'false',
        }
        setForm(next)
        applyThemeLocally(next.theme)
      } catch (e) {
        // valeurs par défaut si 404/500
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const upsertParam = async (cle, valeur, description) => {
    const existing = keyIndex[cle]
    const payload = { cle, valeur, ...(description ? { description } : {}) }
    if (existing?.id_param) {
      await api.put(`/settings/${existing.id_param}`, payload)
    } else {
      await api.post(`/settings`, payload)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await Promise.all([
        upsertParam(SETTINGS_KEYS.siteName, form.siteName),
        upsertParam(SETTINGS_KEYS.contactEmail, form.contactEmail),
        upsertParam(SETTINGS_KEYS.theme, form.theme),
        upsertParam(SETTINGS_KEYS.itemsPerPage, String(form.itemsPerPage)),
        upsertParam(SETTINGS_KEYS.enableNotifications, String(!!form.enableNotifications)),
      ])
      // Apply theme immediately on client
      applyThemeLocally(form.theme)
      toast.success('Paramètres enregistrés')
      // recharger l'index
      const res = await api.get('/settings')
      setRecords(Array.isArray(res?.data) ? res.data : (res?.data?.data || []))
    } catch (e2) {
      toast.error(e2?.response?.data?.message || e2?.message || 'Erreur sauvegarde paramètres')
    } finally { setLoading(false) }
  }

  const onThemeChange = (e) => {
    const value = e.target.value
    setForm(v => ({ ...v, theme: value }))
    // Apply immediately regardless of save result
    applyThemeLocally(value)
  }

  const SidebarItem = ({ active, children }) => (
    <div className={`px-4 py-2 rounded-md text-sm cursor-default ${active ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'}`}>{children}</div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero header */}
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur px-6 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-lg font-semibold">
              {(user?.prenom?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Paramètres</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Personnalisez votre expérience selon votre rôle</p>
            </div>
            <div className="hidden md:block text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase tracking-wide">{role}</div>
          </div>
        </div>
          {/* Carte profil rapide */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200/70 dark:border-slate-700/60 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profil</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{user?.prenom} {user?.nom} — {user?.email}</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-slate-600 dark:text-slate-300">Rôle: <span className="font-medium text-slate-900 dark:text-slate-100 uppercase">{role}</span></div>
            </div>
          </div>

          {/* Bloc sécurité - visible à tous */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60">
            <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-700/60">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sécurité</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Protégez votre compte et surveillez les accès</p>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Modifier le mot de passe</span>
                <button className="px-3 py-1.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Gérer</button>
              </div>
              <div className="flex items-center justify-between">
                <span>Activer la double authentification (2FA)</span>
                <button className="px-3 py-1.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Configurer</button>
              </div>
              <div className="flex items-center justify-between">
                <span>Voir les connexions récentes</span>
                <button className="px-3 py-1.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Consulter</button>
              </div>
            </div>
          </div>

          {/* Bloc notifications - visible à tous */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60">
            <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-700/60">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choisissez comment être informé</p>
            </div>
            <div className="p-6 space-y-3">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" checked={form.enableNotifications} onChange={(e)=>setForm(v=>({...v, enableNotifications:e.target.checked}))} />
                Recevoir des notifications sur la plateforme
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300" /> Nouvelles formations publiées</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300" /> Validation d'un quiz ou d'un certificat</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300" /> Paiement ou inscription confirmée</label>
              </div>
            </div>
          </div>

          {/* Apparence / Préférences - formateur + admin */}
          {(role === 'formateur' || role === 'admin') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60">
              <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-700/60">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Apparence / Préférences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Thème de l’interface et densité d’affichage</p>
              </div>
              <form onSubmit={save} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-300">Thème</label>
                    <select value={form.theme} onChange={onThemeChange} className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="system">Système</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-300">Éléments par page</label>
                    <input type="number" min={5} max={100} value={form.itemsPerPage} onChange={(e)=>setForm(v=>({...v, itemsPerPage:Number(e.target.value)}))} className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm">
                    {loading ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Paramètres globaux - admin uniquement */}
          {role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-900">Paramètres globaux</h3>
        </div>
        <form onSubmit={save} className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-700">Nom du site</label>
            <input value={form.siteName} onChange={(e)=>setForm(v=>({...v, siteName:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email de contact</label>
            <input type="email" value={form.contactEmail} onChange={(e)=>setForm(v=>({...v, contactEmail:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
            </div>
          )}

          {/* Paiements - admin */}
          {role === 'admin' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Paiements</h3>
              <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>Historique des transactions</li>
                <li>Méthodes de paiement sauvegardées</li>
              </ul>
            </div>
          )}

          {/* Confidentialité - tous */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Confidentialité</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
              <li>Gérer les données personnelles</li>
              <li>Télécharger mes données</li>
            </ul>
          </div>
      </div>
    </div>
  )
}




