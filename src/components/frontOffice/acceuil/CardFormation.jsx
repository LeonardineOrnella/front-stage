"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, Star, BookOpen, Play, FileText, Eye, Image as ImageIcon } from 'lucide-react';
import { formationService } from '@/service/formation.service';
import { categorieService } from '@/service/categorie.service';
import FormationDetail from './FormationDetail';
import { transactionService } from '@/service/transaction.service';
 

export default function CardFormation() {
  const router = useRouter();
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showAllFormations, setShowAllFormations] = useState(false);
  const [formationsInscrites, setFormationsInscrites] = useState(new Set());

  useEffect(() => {
    fetchFormations();
    fetchCategories();
    fetchFormationsInscrites();
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

  const fetchFormationsInscrites = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setFormationsInscrites(new Set());
        return;
      }
      const transactionsResponse = await transactionService.getMyTransactions();
      const transactions = transactionsResponse.data?.data || [];
      const formationsInscritesIds = new Set(
        transactions
          .filter(t => String(t.statut_trans || '').toLowerCase() === 'validee')
          .map(t => Number(t.id_form))
          .filter(Boolean)
      );
      setFormationsInscrites(formationsInscritesIds);
    } catch (error) {
      console.error('Erreur lors du chargement des formations inscrites:', error);
      setFormationsInscrites(new Set());
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

  // Filtrer les formations : afficher uniquement celles où l'utilisateur est inscrit (si connecté)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const filteredFormations = token 
    ? enrichedFormations.filter(formation => 
        formationsInscrites.has(Number(formation.id_form))
      )
    : []; // Si non connecté, ne rien afficher dans cette section

  // Pagination
  const totalPages = showAllFormations ? 1 : Math.ceil(filteredFormations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFormations = showAllFormations ? filteredFormations : filteredFormations.slice(startIndex, endIndex);

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

  const handleInscriptionClick = async (formation) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.push('/inscription'); return; }
    try {
      const hasAccess = await transactionService.checkFormationAccess(formation.id_form);
      if (hasAccess) {
        router.push(`/dasboard/apprenant/formation/${formation.id_form}/contenu`);
        return;
      }
    } catch {}
    router.push(`/dasboard/apprenant/checkout/${formation.id_form}`);
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {token ? 'Mes formations' : 'Nos formations'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {token 
                ? 'Retrouvez toutes vos formations inscrites et continuez votre apprentissage.'
                : 'Explorez une sélection de parcours conçus avec nos experts pour renforcer vos compétences techniques et accélérer votre carrière.'
              }
            </p>
            {token && !showAllFormations && filteredFormations.length > itemsPerPage && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setShowAllFormations(true);
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                >
                  Voir toutes mes formations
                </button>
            </div>
            )}
          </div>

          {/* Grille des formations */}
          {filteredFormations.length === 0 && token ? (
            <div className="text-center py-12 mb-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation inscrite</h3>
              <p className="text-gray-600 mb-4">Vous n'êtes inscrit à aucune formation pour le moment.</p>
              <a 
                href="/dasboard/apprenant/catalogue" 
                className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
              >
                Parcourir le catalogue
              </a>
            </div>
          ) : !token ? (
            <div className="text-center py-12 mb-12">
              <p className="text-gray-600 mb-4">Connectez-vous pour voir vos formations inscrites.</p>
              <a 
                href="/connexion" 
                className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
              >
                Se connecter
              </a>
            </div>
          ) : (
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
                          title={'Voir les détails'}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {formationsInscrites.has(Number(formation.id_form)) ? (
                          <button 
                            onClick={() => router.push(`/dasboard/apprenant/formation/${formation.id_form}`)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105"
                          >
                            Accéder
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleInscriptionClick(formation)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                          >
                            S'inscrire
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Pagination */}
          {filteredFormations.length > 0 && !showAllFormations && totalPages > 1 && (
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
              <h3 className="text-3xl font-bold mb-4">Commencez dès aujourd'hui</h3>
              <p className="text-xl mb-8 opacity-90">Accédez à des contenus de qualité</p>
              <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Explorer les formations
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
