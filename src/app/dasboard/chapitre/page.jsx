'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const API_CHAP = "http://localhost:3001/api/chapitres";
const API_CAT = "http://localhost:3001/api/categories";

const Chapitres = () => {
  const [categories, setCategories] = useState([]);
  const [chapitres, setChapitres] = useState([]);
  const [filteredChapitres, setFilteredChapitres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingChapitre, setEditingChapitre] = useState(null);

  const [formData, setFormData] = useState({
    titre_chap: '',
    duree: '',
    ordre: 1,
    type: 'Publié',
    id_categ: null,
  });

  // Charger catégories + chapitres
  useEffect(() => {
    axios.get(API_CAT).then((res) => setCategories(res.data));
    axios.get(API_CHAP).then((res) => {
      setChapitres(res.data);
      setFilteredChapitres(res.data);
    });
  }, []);

  // Filtrage
  useEffect(() => {
    let filtered = chapitres;
    if (selectedCategorie) {
      filtered = filtered.filter(c => c.id_categ === selectedCategorie.id_categ);
    }
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.titre_chap.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredChapitres(filtered);
  }, [chapitres, searchTerm, selectedCategorie]);

  // Ouvrir modal
  const openModal = (chapitre = null) => {
    if (!selectedCategorie && !chapitre) {
      alert("Veuillez sélectionner une catégorie !");
      return;
    }
    if (chapitre) {
      setEditingChapitre(chapitre);
      setFormData(chapitre);
    } else {
      setEditingChapitre(null);
      setFormData({
        titre_chap: '',
        duree: '',
        ordre: 1,
        type: 'Publié',
        id_categ: selectedCategorie?.id_categ || null,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingChapitre(null);
  };

  // Changement input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Sauvegarde (Add/Update)
  const handleSubmit = async () => {
    if (!formData.titre_chap || !formData.duree) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    if (editingChapitre) {
      await axios.put(`${API_CHAP}/${editingChapitre.id_chap}`, formData);
      setChapitres(prev =>
        prev.map(c => c.id_chap === editingChapitre.id_chap ? { ...formData, id_chap: editingChapitre.id_chap } : c)
      );
    } else {
      const res = await axios.post(API_CHAP, formData);
      setChapitres(prev => [...prev, { ...formData, id_chap: res.data.id }]);
    }
    closeModal();
  };

  // Suppression
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce chapitre ?")) {
      await axios.delete(`${API_CHAP}/${id}`);
      setChapitres(prev => prev.filter(c => c.id_chap !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Gestion des Chapitres
          </h1>
          <p className="text-center text-gray-600">
            Organisez vos chapitres par catégorie de formation
          </p>
        </div>

        {/* Sélecteur de catégorie */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Sélectionner une catégorie
          </label>
          <select
            value={selectedCategorie?.id_categ || ""}
            onChange={(e) => {
              const selected = categories.find(cat => cat.id_categ === Number(e.target.value))
              setSelectedCategorie(selected || null)
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choisir une catégorie --</option>
            {categories.map((cat) => (
              <option key={cat.id_categ} value={cat.id_categ}>
                {cat.nom_categ}
              </option>
            ))}
          </select>
        </div>

        {/* Barre d'actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un chapitre..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nouveau Chapitre
          </button>
        </div>

        {/* Liste des chapitres */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Titre</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Durée</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Ordre</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Type</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChapitres.map(chapitre => (
                <tr key={chapitre.id_chap} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">{chapitre.titre_chap}</td>
                  <td className="py-4 px-4">{chapitre.duree}</td>
                  <td className="py-4 px-4">{chapitre.ordre}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${chapitre.type === "Publié"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {chapitre.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(chapitre)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(chapitre.id_chap)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredChapitres.length === 0 && (
            <div className="text-center py-10 text-gray-500">Aucun chapitre trouvé</div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingChapitre ? "Modifier Chapitre" : "Nouveau Chapitre"}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre *</label>
                  <input
                    type="text"
                    name="titre_chap"
                    value={formData.titre_chap}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durée *</label>
                    <input
                      type="text"
                      name="duree"
                      value={formData.duree}
                      onChange={handleInputChange}
                      placeholder="ex: 2h, 1j"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ordre *</label>
                    <input
                      type="number"
                      name="ordre"
                      value={formData.ordre}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Publié">Publié</option>
                    <option value="Brouillon">Brouillon</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 p-6 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  {editingChapitre ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapitres;
