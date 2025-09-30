'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { categorieService } from '@/service/categorie.service'
import RequireRole from '@/components/backoOffice/RequireRole'


export default function CategoriePage() {
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedCategorie, setSelectedCategorie] = useState(null)
  const [formData, setFormData] = useState({ nom_categ: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 5

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const data = await categorieService.getAllCategories()
      setCategories(data)
    } catch (err) {
      toast.error("Erreur lors du chargement des catégories")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrage recherche
  const filteredCategories = categories.filter(c =>
    c.nom_categ?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Ouvrir le modal d'ajout/modification
  const openFormModal = (categ = null) => {
    if (categ) {
      setSelectedCategorie(categ)
      setFormData({ nom_categ: categ.nom_categ })
    } else {
      setSelectedCategorie(null)
      setFormData({ nom_categ: "" })
    }
    setShowFormModal(true)
  }

  // Sauvegarder catégorie
  const handleSave = async () => {
    if (!formData.nom_categ?.trim()) {
      toast.warning('Le nom de la catégorie est requis')
      return
    }
    try {
      setIsSaving(true)
      if (selectedCategorie) {
        await categorieService.updateCategorie(selectedCategorie.id_categ, { nom_categ: formData.nom_categ.trim() })
        toast.success("Catégorie modifiée avec succès")
      } else {
        await categorieService.createCategorie({ nom_categ: formData.nom_categ.trim() })
        toast.success("Catégorie ajoutée avec succès")
      }
      setShowFormModal(false)
      fetchCategories()
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  // Suppression
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await categorieService.deleteCategorie(selectedCategorie.id_categ)
      toast.success("Catégorie supprimée")
      setShowDeleteModal(false)
      fetchCategories()
    } catch (err) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <RequireRole roles={['admin']}>
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {categories.length} au total
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">Créez, renommez et supprimez les catégories pour organiser vos contenus.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(""); setCurrentPage(1) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Effacer la recherche"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => openFormModal()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && (
                <>
                  {Array.from({ length: itemsPerPage }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td className="px-6 py-4">
                        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {!isLoading && paginatedCategories.map(categ => (
                <tr key={categ.id_categ} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                        {categ.nom_categ?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <span className="font-medium text-gray-900">{categ.nom_categ}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openFormModal(categ)}
                        className="p-2 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        title="Modifier"
                        disabled={isSaving || isDeleting}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedCategorie(categ); setShowDeleteModal(true) }}
                        className="p-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                        title="Supprimer"
                        disabled={isSaving || isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && paginatedCategories.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-10">
                    <div className="flex flex-col items-center justify-center text-center text-gray-500">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium">Aucune catégorie trouvée</p>
                      <p className="text-sm">Essayez de modifier votre recherche ou créez une nouvelle catégorie.</p>
                      <button
                        onClick={() => openFormModal()}
                        className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" /> Ajouter une catégorie
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1.5 border rounded-full text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-full text-sm border ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1.5 border rounded-full text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal Form (Add/Edit) */}
      {showFormModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedCategorie ? "Modifier Catégorie" : "Ajouter Catégorie"}
            </h2>
            <input
              type="text"
              placeholder="Nom de la catégorie"
              value={formData.nom_categ}
              onChange={(e) => setFormData({ ...formData, nom_categ: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-1 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mb-3">Obligatoire • 50 caractères max</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.nom_categ?.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment supprimer <span className="font-semibold">{selectedCategorie?.nom_categ}</span> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RequireRole>
  )
}
