"use client"
import { useEffect, useMemo, useState } from "react"
import { formationService } from "@/service/formation.service"
import { categorieService } from "@/service/categorie.service"
import { transactionService } from "@/service/transaction.service"
// Charts (installer: npm i recharts)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [formations, setFormations] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const [f, c] = await Promise.all([
          formationService.getAllFormations(),
          categorieService.getAllCategories()
        ])
        setFormations(Array.isArray(f) ? f : [])
        setCategories(Array.isArray(c) ? c : [])
        try {
          const tRes = await transactionService.getAllTransactions()
          const list = Array.isArray(tRes?.data?.data)
            ? tRes.data.data
            : Array.isArray(tRes?.data)
            ? tRes.data
            : Array.isArray(tRes)
            ? tRes
            : []
          setTransactions(list)
        } catch {
          setTransactions([])
        }
      } catch (e) {
        setError(e?.message || "Erreur chargement statistiques")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalFormations = formations.length
    const totalCategories = categories.length
    const totalChapitres = formations.reduce((acc, f) => acc + (f.chapitres?.length || 0), 0)
    const totalRessources = formations.reduce(
      (acc, f) => acc + (f.chapitres || []).reduce((a, ch) => a + (ch.ressources?.length || 0), 0),
      0
    )
    const totalPDF = formations.reduce(
      (acc, f) => acc + (f.chapitres || []).reduce((a, ch) => a + (ch.ressources || []).filter((r) => r.type === "pdf").length, 0),
      0
    )
    const totalVideos = formations.reduce(
      (acc, f) => acc + (f.chapitres || []).reduce((a, ch) => a + (ch.ressources || []).filter((r) => r.type === "video").length, 0),
      0
    )
    const totalTransactions = transactions.length
    const ca = transactions.reduce((acc, t) => acc + (Number(t.montant) || 0), 0)
    const caValide = transactions
      .filter((t) => String(t.statut_trans) === "Validee")
      .reduce((acc, t) => acc + (Number(t.montant) || 0), 0)
    return { totalFormations, totalCategories, totalChapitres, totalRessources, totalPDF, totalVideos, totalTransactions, ca, caValide }
  }, [formations, categories, transactions])

  const byCategory = useMemo(() => {
    const map = new Map()
    for (const f of formations) {
      const catId = f.id_categ
      map.set(catId, (map.get(catId) || 0) + 1)
    }
    return Array.from(map.entries()).map(([id, count]) => ({
      id,
      count,
      label: categories.find((c) => c.id_categ === id)?.nom_categ || `Cat ${id}`
    }))
  }, [formations, categories])

  const maxCat = useMemo(() => (byCategory.length ? byCategory.reduce((m, r) => Math.max(m, r.count), 0) : 1), [byCategory])

  const resourcesSummary = useMemo(() => {
    const pdf = formations.reduce((acc, f) => acc + (f.chapitres || []).reduce((a, ch) => a + (ch.ressources || []).filter((r) => r.type === "pdf").length, 0), 0)
    const video = formations.reduce((acc, f) => acc + (f.chapitres || []).reduce((a, ch) => a + (ch.ressources || []).filter((r) => r.type === "video").length, 0), 0)
    return [
      { name: "PDF", value: pdf, color: "#ef4444" },
      { name: "Vidéos", value: video, color: "#3b82f6" }
    ]
  }, [formations])

  // Small helpers for card mini charts
  const safePercent = (v, cap = 100) => {
    if (!isFinite(v) || v == null) return 0
    return Math.max(2, Math.min(cap, Math.round(v)))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Statistiques & Rapports</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Vue d’ensemble des formations, chapitres, ressources et paiements.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-300">Chargement…</div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <>
            {/* Improved Cards with mini charts and animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Formations */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-300 font-medium">Formations</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalFormations}</div>
                  </div>
                  <div className="text-3xl animate-bounce">📘</div>
                </div>

                {/* mini sparkline-style bar representation */}
                <div className="mt-4 h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-700"
                    style={{ width: `${safePercent((stats.totalFormations / (stats.totalFormations + 10)) * 100)}%` }}
                  />
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Total catégories : {stats.totalCategories}</div>
              </div>

              {/* Chapitres */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-300 font-medium">Chapitres</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalChapitres}</div>
                  </div>
                  <div className="text-3xl animate-bounce">📑</div>
                </div>

                <div className="mt-4 h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-700"
                    style={{ width: `${safePercent(Math.min(100, stats.totalChapitres * 4))}%` }}
                  />
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Moyenne ressources/chapitre : {Math.round(stats.totalRessources / Math.max(1, stats.totalChapitres))}</div>
              </div>

              {/* Ressources */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-300 font-medium">Ressources</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRessources}</div>
                  </div>
                  <div className="text-2xl">📦</div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                    <span>PDF {stats.totalPDF}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Vidéos {stats.totalVideos}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div
                    role="img"
                    aria-label="mini-donut"
                    className="w-12 h-12 rounded-full border-8 border-red-500 border-t-transparent animate-spin"
                    style={{ borderColor: `${resourcesSummary[0].color}`, borderTopColor: "transparent" }}
                  />
                  <div className="text-xs text-gray-600 dark:text-gray-300">Répartition PDF / Vidéos</div>
                </div>
              </div>

              {/* CA */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-300 font-medium">CA validé</div>
                    <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.caValide.toFixed(2)} €</div>
                  </div>
                  <div className="text-3xl animate-pulse">💰</div>
                </div>

                <div className="mt-4 h-2 w-full bg-gray-100 dark:bg-gray-700 rounded">
                  <div
                    className="h-2 bg-emerald-500 dark:bg-emerald-400 rounded transition-all duration-700"
                    style={{
                      width: `${safePercent((stats.caValide / Math.max(1, stats.caValide + 200)) * 100)}%`
                    }}
                  />
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Transactions totales : {stats.totalTransactions}</div>
              </div>
            </div>

            {/* Category distribution with improved chart container */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Formations par catégorie</h2>
                <div className="text-sm text-gray-500 dark:text-gray-300">{byCategory.length} catégories</div>
              </div>

              {byCategory.length === 0 ? (
                <div className="text-gray-600 dark:text-gray-300 text-sm">Aucune donnée.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-lg overflow-hidden border border-gray-50 dark:border-gray-700">
                      {byCategory.map((row) => (
                        <li key={row.id} className="py-3 px-4 flex items-center justify-between bg-white dark:bg-gray-800">
                          <div className="text-gray-800 dark:text-gray-200 truncate">{row.label}</div>
                          <div className="flex items-center gap-4">
                            <div className="text-gray-900 dark:text-white font-semibold">{row.count}</div>
                            <div className="w-40 bg-gray-100 dark:bg-gray-700 h-2 rounded overflow-hidden">
                              <div
                                className="h-2 bg-emerald-500 dark:bg-emerald-400 transition-all"
                                style={{ width: `${Math.max(6, (row.count / maxCat) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byCategory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} interval={0} angle={-15} textAnchor="end" height={50} />
                        <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} />
                        <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
                        <Bar dataKey="count" name="Formations" fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal bars section */}
            {byCategory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border dark:border-gray-700 mb-6">
                <div className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Graphique — Formations par catégorie</div>
                <div className="space-y-3">
                  {byCategory.map((row) => (
                    <div key={`bar-${row.id}`} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-transparent dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
                        <span className="truncate pr-2">{row.label}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{row.count}</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded">
                        <div
                          className="h-3 bg-emerald-500 dark:bg-emerald-400 rounded transition-all duration-700"
                          style={{ width: `${Math.max(6, (row.count / maxCat) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pie chart resources */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Répartition des ressources</h2>
                <div className="text-sm text-gray-500 dark:text-gray-300">{resourcesSummary.reduce((s, r) => s + r.value, 0)} ressources</div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
                    <ReLegend verticalAlign="bottom" />
                    <Pie
                      data={resourcesSummary}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
                      animationDuration={1000}
                    >
                      {resourcesSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Export CSV */}
          
          </>
        )}
      </div>
    </div>
  )
}
