'use client' 
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { GraduationCap, Mail, Trash2, Search, Eye, Plus, Edit, X } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const API_USERS = "http://localhost:3001/api/users"

export default function Formateurs() {
  const [formateurs, setFormateurs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingFormateur, setEditingFormateur] = useState(null)
  const [viewFormateur, setViewFormateur] = useState(null)
  const [deleteFormateur, setDeleteFormateur] = useState(null)

  const itemsPerPage = 5
  const [formData, setFormData] = useState({ prenom: '', nom: '', email: '', mdp: '', role: 'formateur' })

  useEffect(() => {
    fetchFormateurs()
  }, [])

  const fetchFormateurs = async () => {
    try {
      const res = await axios.get(API_USERS)
      const onlyFormateurs = res.data.filter(u => u.role === 'formateur')
      setFormateurs(onlyFormateurs)
    } catch (err) {
      toast.error("Erreur lors du chargement des formateurs")
      console.error(err)
    }
  }

  // Filtrage
  const filteredFormateurs = formateurs.filter(f =>
    f.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredFormateurs.length / itemsPerPage)
  const paginatedFormateurs = filteredFormateurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Supprimer
  const handleDelete = async () => {
    if (!deleteFormateur) return
    try {
      await axios.delete(`${API_USERS}/${deleteFormateur.id}`)
      setFormateurs(prev => prev.filter(f => f.id !== deleteFormateur.id))
      toast.success("Formateur supprimé avec succès")
      setDeleteFormateur(null)
    } catch (err) {
      toast.error("Erreur lors de la suppression")
      console.error(err)
    }
  }

  // Ajouter ou Modifier
  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      prenom: formData.prenom.trim(),
      nom: formData.nom.trim(),
      email: formData.email.trim(),
      role: "formateur"
    }

    if (!editingFormateur && formData.mdp.trim() !== "") {
      payload.mdp = formData.mdp
    }

    try {
      if (editingFormateur) {
        const res = await axios.put(`${API_USERS}/${editingFormateur.id}`, payload)
        setFormateurs(prev =>
          prev.map(f => f.id === editingFormateur.id ? res.data : f)
        )
        toast.success("Formateur modifié avec succès")
      } else {
        const res = await axios.post(API_USERS, payload)
        setFormateurs(prev => [...prev, res.data])
        toast.success("Formateur ajouté avec succès")
      }

      setShowForm(false)
      setEditingFormateur(null)
      setFormData({ prenom: '', nom: '', email: '', mdp: '', role: 'formateur' })
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement")
      console.error(err.response?.data || err.message)
    }
  }

  // Préparer édition
  const handleEdit = (formateur) => { 
    setEditingFormateur(formateur)
    setFormData({
      prenom: formateur.prenom || '',
      nom: formateur.nom || '',
      email: formateur.email || '',
      mdp: '',
      role: 'formateur'
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            Formateurs ({formateurs.length})
          </h1>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingFormateur(null) }}
              className="ml-3 flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="border rounded-lg p-2"
                required
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="border rounded-lg p-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border rounded-lg p-2 col-span-2"
                required
              />
              {!editingFormateur && (
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={formData.mdp}
                  onChange={(e) => setFormData({ ...formData, mdp: e.target.value })}
                  className="border rounded-lg p-2 col-span-2"
                  required
                />
              )}
              <div className="flex gap-2 col-span-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  {editingFormateur ? "Modifier" : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingFormateur(null) }}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nom & Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rôle</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedFormateurs.map((formateur, idx) => (
                <tr key={formateur.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                  <td className="px-6 py-4 font-medium text-gray-900">{formateur.prenom} {formateur.nom}</td>
                  <td className="px-6 py-4 text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> {formateur.email}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {formateur.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3 justify-center">
                    <button onClick={() => setViewFormateur(formateur)} className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleEdit(formateur)} className="text-green-600 hover:text-green-800 transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => setDeleteFormateur(formateur)} className="text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedFormateurs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">Aucun formateur trouvé</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal détails */}
      {viewFormateur && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Détails du formateur</h2>
            <p><strong>Prénom:</strong> {viewFormateur.prenom}</p>
            <p><strong>Nom:</strong> {viewFormateur.nom}</p>
            <p><strong>Email:</strong> {viewFormateur.email}</p>
            <button
              onClick={() => setViewFormateur(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteFormateur && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4 text-red-600">Confirmation</h2>
            <p>Voulez-vous vraiment supprimer <strong>{deleteFormateur.prenom} {deleteFormateur.nom}</strong> ?</p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setDeleteFormateur(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
