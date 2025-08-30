"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Users, Star, BookOpen, Play, FileText, Eye, Image as ImageIcon } from 'lucide-react';
import { formationService } from '@/service/formation.service';
import { categorieService } from '@/service/categorie.service';
import FormationDetail from './FormationDetail';

export default function CardFormation() {
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedFormation, setSelectedFormation] = useState(null);

  useEffect(() => {
    fetchFormations();
    fetchCategories();
  }, []);

  const fetchFormations = async () => {
    try {
      const response = await formationService.getAllFormations();
      console.log('Formations récupérées:', response);
      setFormations(response);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categorieService.getAllCategories();
      console.log('Catégories récupérées:', response);
      setCategories(response);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setCategories([]);
    }
  };

  // Enrichir les formations avec les informations de catégorie et les comptes
  const enrichedFormations = formations.map(formation => {
    const category = categories.find(cat => cat.id_categ === formation.id_categ);
    
    // Calculer le nombre total de chapitres
    const chapitres_count = formation.chapitres ? formation.chapitres.length : 0;
    
    // Calculer le nombre total de ressources
    const ressources_count = formation.chapitres ? 
      formation.chapitres.reduce((total, chapitre) => {
        return total + (chapitre.ressources ? chapitre.ressources.length : 0);
      }, 0) : 0;

    return {
      ...formation,
      categorie: category ? category.nom_categ : 'Général',
      chapitres_count,
      ressources_count
    };
  });

  // Filtrer les formations
  const filteredFormations = enrichedFormations.filter(formation => {
    const matchesSearch = formation.titre_form.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || formation.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFormations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFormations = filteredFormations.slice(startIndex, endIndex);

  // Catégories uniques pour le filtre
  const uniqueCategories = ['all', ...Array.from(new Set(enrichedFormations.map(f => f.categorie)))];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'En cours': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const getImageUrl = (formation) => {
    if (formation.image_couverture) {
      // Si l'image commence par /uploads, c'est un chemin relatif
      if (formation.image_couverture.startsWith('/uploads')) {
        return `http://localhost:3001${formation.image_couverture}`;
      }
      // Sinon, c'est peut-être déjà une URL complète
      return formation.image_couverture;
    }
    return null;
  };

  const handleViewDetails = (formation) => {
    setSelectedFormation(formation);
  };

  const handleCloseDetail = () => {
    setSelectedFormation(null);
  };

  if (loading) {
    return (
      <div id="formations" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des formations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="formations" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Découvrez nos formations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des formations de qualité pour développer vos compétences et 
              accélérer votre carrière professionnelle
            </p>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors min-w-[300px]"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              >
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Toutes les catégories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-gray-600">
              {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Grille des formations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentFormations.map((formation) => {
              const imageUrl = getImageUrl(formation);
              
              return (
                <div key={formation.id_form} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Image de couverture */}
                  <div className="relative h-48 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={formation.titre_form}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-emerald-600 flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                      <ImageIcon className="w-16 h-16 text-white opacity-80" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formation.statut_form)}`}>
                        {formation.statut_form}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-6">
                    {/* Catégorie */}
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                        {formation.categorie || 'Général'}
                      </span>
                    </div>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {formation.titre_form}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {formation.description}
                    </p>

                    {/* Statistiques */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formation.duree_form}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{formation.chapitres_count || 0} chapitres</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{formation.ressources_count || 0} ressources</span>
                      </div>
                    </div>

                    {/* Prix et actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatPrice(formation.frais_form)}€
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(formation)}
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors" 
                          title="Voir détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105">
                          S'inscrire
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}

          {/* Call-to-action */}
          <div className="text-center mt-16">
            <div className="bg-emerald-600 rounded-2xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">
                Prêt à commencer votre formation ?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez des milliers d'apprenants qui ont déjà transformé leur carrière
              </p>
              <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Commencer maintenant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détail des formations */}
      {selectedFormation && (
        <FormationDetail 
          formation={selectedFormation} 
          onClose={handleCloseDetail} 
        />
      )}
    </>
  );
}
