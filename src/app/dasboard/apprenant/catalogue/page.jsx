'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Users, Star, Search, Filter, Play, FileText, Eye } from 'lucide-react';
import { userService } from '@/service/user.service';
import { toast } from 'react-toastify';

export default function CataloguePage() {
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    loadCatalogue();
  }, []);

  const loadCatalogue = async () => {
    try {
      const catalogueData = await userService.consulterCatalogue();
      setFormations(catalogueData.formations || []);
      setCategories(catalogueData.categories || []);
    } catch (error) {
      console.error('Erreur lors du chargement du catalogue:', error);
      toast.error('Erreur lors du chargement du catalogue');
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async (formationId) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('Vous devez être connecté pour vous inscrire');
        return;
      }

      const user = JSON.parse(userData);
      await userService.inscrireFormation(user.id, formationId);
      toast.success('Inscription réussie !');
      
      // Recharger le catalogue pour mettre à jour les statuts
      loadCatalogue();
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Erreur lors de l\'inscription');
    }
  };

  // Filtrage des formations
  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre_form.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || formation.id_categ.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFormations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFormations = filteredFormations.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogue des Formations</h1>
          <p className="text-gray-600">Découvrez toutes nos formations disponibles</p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id_categ} value={category.id_categ}>
                    {category.nom_categ}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grille des formations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentFormations.map((formation) => (
            <div key={formation.id_form} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image de couverture */}
              <div className="relative h-48 bg-emerald-600 flex items-center justify-center">
                {formation.image_couverture ? (
                  <img
                    src={`http://localhost:3001${formation.image_couverture}`}
                    alt={formation.titre_form}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-16 h-16 text-white opacity-80" />
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formation.statut_form)}`}>
                    {formation.statut_form}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {formation.titre_form}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {formation.description}
                </p>

                {/* Métadonnées */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formation.duree_form}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{formation.chapitres?.length || 0} chapitres</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>4.5</span>
                  </div>
                </div>

                {/* Prix et actions */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-emerald-600">
                    {parseFloat(formation.frais_form).toFixed(2)}€
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors" title="Voir détails">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleInscription(formation.id_form)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      S'inscrire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(endIndex, filteredFormations.length)}
                </span>{' '}
                sur <span className="font-medium">{filteredFormations.length}</span> formations
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Précédent
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        page === currentPage
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message si aucune formation */}
        {filteredFormations.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}