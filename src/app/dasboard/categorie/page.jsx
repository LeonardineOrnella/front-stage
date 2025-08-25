'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'

import { toast } from "react-toastify";
import { categorieService } from '@/service/categorie.service';

const Categorie = () => {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategorie, setEditingCategorie] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    statut: 'Active',
  })

  // 🔔 Notification state
  const [notification, setNotification] = useState({ message: "", type: "" })

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: "", type: "" }), 3000)
  }

  // Charger les catégories depuis le backend
  const fetchCategories = async () => {
    try {
      categorieService.getcategorie().then(res=> {
          
          setCategories(res.data)
          setFilteredCategories(res.data)
      }).catch(err=>{
        console.log(err);
        
      })
     
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
      showNotification("Erreur lors du chargement des catégories ❌", "error")
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filtrage
  useEffect(() => {
    const filtered = categories.filter(cat =>
      cat.nom_categ.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  const openModal = (categorie = null) => {
    if (categorie) {
      setEditingCategorie(categorie)
      setFormData({
        nom: categorie.nom_categ,
        description: categorie.description,
        statut: categorie.statut
      })
    } else {
      setEditingCategorie(null)
      setFormData({ nom: '', description: '', statut: 'Active' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategorie(null)
    setFormData({ nom: '', description: '', statut: 'Active' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Ajouter ou modifier
  const handleSubmit = async () => {
    if (!formData.nom) {
      showNotification("Veuillez entrer un nom de catégorie", "error")
      return
    }

    try {
      if (editingCategorie) {
        // Update
        await axios.put(`${API_URL}/${editingCategorie.id_categ}`, {
          nom_categ: formData.nom,
          description: formData.description,
          statut: formData.statut
        })
       
        toast.success("Catégorie modifiée avec succès ✅", "success")
      } else {
        // Create
        await axios.post(API_URL, {
          nom_categ: formData.nom,
          description: formData.description,
          statut: formData.statut
        })
        //showNotification("Catégorie ajoutée avec succès ✅", "success")
        toast.success("Catégorie ajoutée avec succès ");
      }
      await fetchCategories() // recharger après ajout/modif
      closeModal()
    } catch (error) {
      console.error("Erreur ajout/modif:", error)
      showNotification("Erreur lors de l'enregistrement ❌", "error")
    }
  }

  // Supprimer
  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      try {
        await axios.delete(`${API_URL}/${id}`)
        setCategories(prev => prev.filter(cat => cat.id_categ !== id))
        showNotification("Catégorie supprimée avec succès ✅", "success")
      } catch (error) {
        console.error("Erreur suppression:", error)
        showNotification("Erreur lors de la suppression ❌", "error")
      }
    }
  }

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="  bg-gray-50 p-6 ">
      <div className="">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
          <p className="text-gray-600">Organisez vos catégories de formation</p>
        </div>

    
        {/* Barre d'actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une catégorie"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nouvelle Catégorie
          </button>
        </div>

        {/* Liste des catégories */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4">Nom</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Statut</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id_categ} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{cat.nom_categ}</td>
                  <td className="py-3 px-4 text-gray-600">{cat.description}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(cat.statut)}`}>
                      {cat.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button onClick={() => openModal(cat)} className="text-blue-600 hover:text-blue-800 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id_categ)} className="text-red-600 hover:text-red-800 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    Aucune catégorie trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-lg font-semibold">
                  {editingCategorie ? 'Modifier Catégorie' : 'Nouvelle Catégorie'}
                </h2>
                <button onClick={closeModal}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 p-6 border-t">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  {editingCategorie ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default Categorie
