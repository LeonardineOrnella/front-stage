'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, Users, Calendar, Clock } from 'lucide-react';

const Formation = () => {
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    niveau: 'Débutant',
    prix: '',
    formateur: '',
    capaciteMax: '',
    dateDebut: '',
    dateFin: '',
    statut: 'Planifiée'
  });

  // Données d'exemple
  useEffect(() => {
    const formationsExemples = [
      {
        id: 1,
        titre: 'Formation React Avancé',
        description: 'Maîtrisez React avec hooks, contexte et optimisations',
        duree: '40h',
        niveau: 'Avancé',
        prix: 1200,
        formateur: 'Thonny',
        dateDebut: '2025-09-01',
        dateFin: '2025-09-10',
        statut: 'Planifiée'
      },
      {
        id: 2,
        titre: 'JavaScript',
        description: 'Les nouvelles fonctionnalités de JavaScript moderne',
        duree: '24h',
        niveau: 'Intermédiaire',
        prix: 800,
        formateur: 'Jean Martin',
        dateDebut: '2025-08-20',
        dateFin: '2025-08-25',
        statut: 'En cours'
      },
      {
        id: 3,
        titre: 'Base de données MongoDB',
        description: 'Conception et gestion de bases de données NoSQL',
        duree: '32h',
        niveau: 'Intermédiaire',
        prix: 950,
        formateur: 'Sophie Bernard',
        dateDebut: '2025-07-15',
        dateFin: '2025-07-22',
        statut: 'Terminée'
      }
    ];
    setFormations(formationsExemples);
    setFilteredFormations(formationsExemples);
  }, []);

  // Filtrage des formations
  useEffect(() => {
    const filtered = formations.filter(formation =>
      formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.formateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.niveau.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFormations(filtered);
  }, [formations, searchTerm]);

  const openModal = (formation = null) => {
    if (formation) {
      setEditingFormation(formation);
      setFormData(formation);
    } else {
      setEditingFormation(null);
      setFormData({
        titre: '',
        description: '',
        duree: '',
        niveau: 'Débutant',
        prix: '',
        formateur: '',
        capaciteMax: '',
        dateDebut: '',
        dateFin: '',
        statut: 'Planifiée'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFormation(null);
    setFormData({
      titre: '',
      description: '',
      duree: '',
      niveau: 'Débutant',
      prix: '',
      formateur: '',
      capaciteMax: '',
      dateDebut: '',
      dateFin: '',
      statut: 'Planifiée'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validation simple
    if (!formData.titre || !formData.formateur || !formData.duree || !formData.prix || !formData.capaciteMax) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingFormation) {
      // Modifier une formation existante
      setFormations(prev => prev.map(formation =>
        formation.id === editingFormation.id
          ? { ...formData, id: editingFormation.id, prix: parseFloat(formData.prix), capaciteMax: parseInt(formData.capaciteMax) }
          : formation
      ));
    } else {
      // Ajouter une nouvelle formation
      const newFormation = {
        ...formData,
        id: Date.now(),
        prix: parseFloat(formData.prix),
        capaciteMax: parseInt(formData.capaciteMax)
      };
      setFormations(prev => [...prev, newFormation]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      setFormations(prev => prev.filter(formation => formation.id !== id));
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Planifiée': return 'bg-blue-100 text-blue-800';
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'Terminée': return 'bg-gray-100 text-gray-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNiveauColor = (niveau) => {
    switch (niveau) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">Gestion des Formations</h1>
          <p className="text-center text-gray-600">Gérez votre catalogue de formations professionnelles</p>
        </div>

        {/* Barre d'actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Formation
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-10 mb-10">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Formations</p>
                <p className="text-2xl font-bold text-gray-900">{formations.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En cours</p>
                <p className="text-2xl font-bold text-green-600">
                  {formations.filter(f => f.statut === 'En cours').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Planifiées</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formations.filter(f => f.statut === 'Planifiée').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

        
        </div>

        {/* Liste des formations */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Formation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Formateur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Niveau</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Durée</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Prix</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFormations.map((formation) => (
                  <tr key={formation.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{formation.titre}</h3>
                        <p className="text-gray-600 text-sm">{formation.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{formation.formateur}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNiveauColor(formation.niveau)}`}>
                        {formation.niveau}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{formation.duree}</td>
                    <td className="py-4 px-4 text-gray-700">{formation.prix}€</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(formation.statut)}`}>
                        {formation.statut}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(formation)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(formation.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFormations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune formation trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingFormation ? 'Modifier la formation' : 'Nouvelle formation'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la formation *
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formateur *
                    </label>
                    <input
                      type="text"
                      name="formateur"
                      value={formData.formateur}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée *
                    </label>
                    <input
                      type="text"
                      name="duree"
                      value={formData.duree}
                      onChange={handleInputChange}
                      required
                      placeholder="ex: 40h, 5 jours"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau *
                    </label>
                    <select
                      name="niveau"
                      value={formData.niveau}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (€) *
                    </label>
                    <input
                      type="number"
                      name="prix"
                      value={formData.prix}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Planifiée">Planifiée</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminée">Terminée</option>
                      <option value="Annulée">Annulée</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {editingFormation ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Formation;