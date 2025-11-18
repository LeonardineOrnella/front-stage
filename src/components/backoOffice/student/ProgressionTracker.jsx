"use client"
import { useEffect, useMemo, useState } from "react"
import { getSavedProgress } from "@/hooks/useProgression"
import { ressourceService } from "@/service/ressource.service"

export default function ProgressionTracker({ formationId, chapitres = [] }) {
  const saved = getSavedProgress(formationId)
  const completedByChapter = (saved && typeof saved.completedByChapter === 'object') ? saved.completedByChapter : {}
  // Agrégat sauvegardé éventuel (non obligatoire)
  const completedResourcesByChapter = (saved && typeof saved.completedResourcesByChapter === 'object') ? saved.completedResourcesByChapter : {}

  // Stocke dynamiquement les ressources par chapitre quand elles ne sont pas fournies
  const [resourcesByChapter, setResourcesByChapter] = useState({})
  const [loadingMap, setLoadingMap] = useState({})

  useEffect(() => {
    let cancelled = false
    async function fetchMissing() {
      const updates = {}
      const loading = {}
      for (let i = 0; i < chapitres.length; i++) {
        const chap = chapitres[i]
        const cid = chap.id_chap || chap.id || chap.chapitre_id || chap.ID || i
        const provided = Array.isArray(chap.ressources) && chap.ressources.length > 0
        if (!provided && resourcesByChapter[cid] == null) {
          loading[cid] = true
          try {
            const list = await ressourceService.listByChapitre(cid)
            if (!cancelled) updates[cid] = Array.isArray(list) ? list : []
          } catch {
            if (!cancelled) updates[cid] = []
          }
        }
      }
      if (!cancelled && Object.keys(loading).length > 0) setLoadingMap((m) => ({ ...m, ...loading }))
      if (!cancelled && Object.keys(updates).length > 0) setResourcesByChapter((m) => ({ ...m, ...updates }))
      if (!cancelled && Object.keys(loading).length > 0) {
        const cleared = {}
        Object.keys(loading).forEach((k) => { cleared[k] = false })
        setLoadingMap((m) => ({ ...m, ...cleared }))
      }
    }
    fetchMissing()
    return () => { cancelled = true }
  }, [chapitres])

  const rows = useMemo(() => {
    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()
    const userId = user?.id
    return chapitres.map((chap, idx) => {
      const cid = chap.id_chap || chap.id || chap.chapitre_id || chap.ID || idx
      const isDone = !!completedByChapter[cid]?.completed
      const providedResources = Array.isArray(chap.ressources) ? chap.ressources : null
      const resources = providedResources ?? resourcesByChapter[cid] ?? []

      // Sources possibles pour les vues: agrégat sauvegardé OU localStorage `resource_progress_{userId}_{cid}`
      let viewedMap = completedResourcesByChapter[cid] || {}
      if (userId && (!viewedMap || Object.keys(viewedMap).length === 0)) {
        try {
          const key = `resource_progress_${userId}_${cid}`
          const stored = localStorage.getItem(key)
          if (stored) viewedMap = JSON.parse(stored)
        } catch {}
      }
      let viewedCount = 0
      let totalCount = resources.length
      if (totalCount > 0) {
        viewedCount = resources.reduce((acc, r) => acc + (viewedMap[r?.id_res || r?.id] ? 1 : 0), 0)
      } else {
        // si on ne connaît pas le total, utiliser la map vue comme total estimé
        const ids = Object.keys(viewedMap)
        totalCount = ids.length
        viewedCount = ids.filter((k) => !!viewedMap[k]).length
      }
      // Si aucune ressource: regarder `chapter_progress_{userId}_{cid}` pour marqué terminé
      if (totalCount === 0 && userId && !isDone) {
        try {
          const ckey = `chapter_progress_${userId}_${cid}`
          const storedChap = localStorage.getItem(ckey)
          if (storedChap) {
            const data = JSON.parse(storedChap)
            if (data?.completed) viewedCount = totalCount = 1
          }
        } catch {}
      }
      const pct = totalCount > 0 ? Math.round((viewedCount / Math.max(1, totalCount)) * 100) : (isDone ? 100 : 0)

      return { cid, idx, chap, isDone, viewedCount, totalCount, pct }
    })
  }, [chapitres, resourcesByChapter, completedByChapter, completedResourcesByChapter])

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={`chap-${row.cid}`} className="border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-800">Chapitre {row.idx + 1}: {row.chap.titre_chap || row.chap.titre || '—'}</div>
            <div className={`text-xs px-2 py-0.5 rounded-full ${row.isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{row.isDone ? 'Terminé' : 'En cours'}</div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{row.viewedCount}/{row.totalCount} ressources</span>
              <span className="text-gray-800 font-medium">{row.pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


