'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Search, Filter, BookOpen, FileText, Calendar, Clock, DollarSign, ChevronDown, ChevronRight, FolderOpen, File, Play, Download, ExternalLink } from 'lucide-react';
import { formationService } from '../../../service/formation.service';
import { chapService } from '../../../service/chap.service';
import { categorieService } from '../../../service/categorie.service';
import ConfirmModal from '../../../components/backoOffice/ConfirmModal';
import { useUser } from '@/components/backoOffice/student/UserContext';
 

export default function FormationPage() {
  const { user } = useUser();
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedFormations, setExpandedFormations] = useState(new Set());
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [formationsData, categoriesData] = await Promise.all([
        formationService.getAllFormations(),
        categorieService.getAllCategories()
      ]);
      
      // Enrichir les formations avec les données des catégories
      const enrichedFormations = formationsData.map(formation => {
        const category = categoriesData.find(cat => cat.id_categ === formation.id_categ);
        return {
          ...formation,
          category: category || {},
          chapitres: formation.chapitres || [],
          totalChapitres: (formation.chapitres || []).length,
          totalRessources: (formation.chapitres || []).reduce((total, chap) => 
            total + (chap.ressources || []).length, 0
          ),
          totalPDF: (formation.chapitres || []).reduce((total, chap) => 
            total + (chap.ressources || []).filter(r => r.type === 'pdf').length, 0
          ),
          totalVideos: (formation.chapitres || []).reduce((total, chap) => 
            total + (chap.ressources || []).filter(r => r.type === 'video').length, 0
          )
        };
      });
      
      setFormations(enrichedFormations);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (formation) => {
    router.push(`/dasboard/formation/edit/${formation.id_form}`);
  };

  const handleDelete = (formation) => {
    setConfirmState({
      open: true,
      title: 'Supprimer la formation',
      message: `Êtes-vous sûr de vouloir supprimer la formation "${formation.titre_form}" ?`,
      onConfirm: async () => {
      try {
        await formationService.deleteFormation(formation.id_form);
          setConfirmState((s) => ({ ...s, open: false }));
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
          setConfirmState((s) => ({ ...s, open: false }));
      }
    }
    });
  };

  const toggleFormationExpansion = (formationId) => {
    const newExpanded = new Set(expandedFormations);
    if (newExpanded.has(formationId)) {
      newExpanded.delete(formationId);
    } else {
      newExpanded.add(formationId);
    }
    setExpandedFormations(newExpanded);
  };

  const toggleChapterExpansion = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleDeleteChapter = (chapitre) => {
    setConfirmState({
      open: true,
      title: 'Supprimer le chapitre',
      message: `Êtes-vous sûr de vouloir supprimer le chapitre "${chapitre.titre_chap}" ?`,
      onConfirm: async () => {
        try {
          await chapService.remove(chapitre.id_chap);
          setConfirmState((s) => ({ ...s, open: false }));
          await fetchData();
        } catch (error) {
          console.error('Erreur lors de la suppression du chapitre:', error);
          setConfirmState((s) => ({ ...s, open: false }));
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'Brouillon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'Inactive': return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'Brouillon': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'video': return <Play className="w-4 h-4 text-blue-500" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre_form.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || formation.id_categ.toString() === selectedCategory;
    const matchesStatus = !selectedStatus || formation.statut_form === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculs de pagination
  const totalPages = Math.ceil(filteredFormations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFormations = filteredFormations.slice(startIndex, endIndex);

  // Fonctions de pagination
  const goToPage = (page) => {
    setCurrentPage(page);
    setExpandedFormations(new Set()); // Réinitialiser les formations développées
    setExpandedChapters(new Set()); // Réinitialiser les chapitres développés
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const stats = {
    totalFormations: formations.length,
    activeFormations: formations.filter(f => f.statut_form === 'Active').length,
    draftFormations: formations.filter(f => f.statut_form === 'Brouillon').length,
    totalCategories: categories.length,
    totalChapitres: formations.reduce((total, f) => total + f.totalChapitres, 0),
    totalRessources: formations.reduce((total, f) => total + f.totalRessources, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes formations</h1>
              <p className="text-gray-600">Gérez et suivez vos formations</p>
            </div>
            {user?.role === 'formateur' && (
            <button
              onClick={() => router.push('/dasboard/formation/create')}
              className="btn-primary flex items-center gap-2 mt-4 lg:mt-0"
            >
              <Plus className="w-5 h-5" />
              Nouvelle formation
            </button>
            )}
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFormations}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actives</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeFormations}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Brouillons</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.draftFormations}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Catégories</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCategories}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chapitres</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalChapitres}</p>
                </div>
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ressources</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalRessources}</p>
                </div>
                <File className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={'Rechercher...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id_categ} value={category.id_categ}>
                  {category.nom_categ}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Brouillon">Brouillon</option>
            </select>
          </div>
        </div>

        {/* Liste des formations */}
        <div className="space-y-4">
          {currentFormations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory || selectedStatus 
                  ? 'Aucune formation ne correspond'
                  : 'Créez votre première formation'
                }
              </p>
              {!searchTerm && !selectedCategory && !selectedStatus && user?.role === 'formateur' && (
                <button
                  onClick={() => router.push('/dasboard/formation/create')}
                  className="btn-primary"
                >
                  Créer
                </button>
              )}
            </div>
          ) : (
            currentFormations.map(formation => (
              <div key={formation.id_form} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* En-tête de la formation */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Image de couverture réelle depuis la base de données */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md relative">
                        {formation.image_couverture ? (
                          <img 
                            src={`http://localhost:3001${formation.image_couverture}`}
                            alt={`Couverture de ${formation.titre_form}`}
                            className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                            onClick={() => setSelectedImage(formation.image_couverture)}
                            onError={(e) => {
                              // En cas d'erreur de chargement, afficher l'icône par défaut
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${formation.image_couverture ? 'hidden' : 'flex'}`}>
                          <BookOpen className="w-10 h-10 text-blue-600" />
                        </div>
                        
                        {/* Badge de statut sur l'image */}
                        <div className="absolute top-1 right-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white shadow-sm ${
                            formation.statut_form === 'Active' ? 'bg-green-500' :
                            formation.statut_form === 'Inactive' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}>
                            {formation.statut_form === 'Active' ? '✓' : 
                             formation.statut_form === 'Inactive' ? '✗' : '📝'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {formation.titre_form}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(formation.statut_form)}`}>
                            {getStatusIcon(formation.statut_form)}
                          <span className="ml-1">{formation.statut_form}</span>
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {formation.description || 'Pas de description'}
                        </p>
                        
                        {/* Métadonnées de la formation */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {formation.category && (
                            <div className="flex items-center space-x-1">
                              <FolderOpen className="w-4 h-4" />
                              <span>{formation.category.nom_categ}</span>
                            </div>
                          )}
                          {formation.duree_form && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formation.duree_form}</span>
                            </div>
                          )}
                          {formation.frais_form && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formation.frais_form}€</span>
                            </div>
                          )}
                          {formation.date_form && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(formation.date_form).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions et statistiques */}
                    <div className="flex flex-col items-end space-y-3">
                        <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{formation.totalChapitres}</div>
                          <div className="text-sm text-gray-500">chapitres</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFormationExpansion(formation.id_form)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title={'Déplier'}
                        >
                          {expandedFormations.has(formation.id_form) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        {user?.role === 'formateur' && (
                          <>
                          <button
                            onClick={() => router.push(`/dasboard/formateur/ressources?formationId=${formation.id_form}`)}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={'Gérer les ressources'}
                          >
                            <FolderOpen className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(formation)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title={'Modifier'}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(formation)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title={'Supprimer'}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu détaillé (chapitres et ressources) */}
                {expandedFormations.has(formation.id_form) && (
                  <div className="border-t border-gray-200">
                    {/* Résumé des ressources */}
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Récapitulatif des ressources</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4 text-red-500" />
                            <span>{formation.totalPDF} PDF</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Play className="w-4 h-4 text-blue-500" />
                            <span>{formation.totalVideos} vidéos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <File className="w-4 h-4 text-gray-500" />
                            <span>{formation.totalRessources} ressources</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Liste des chapitres */}
                    <div className="px-6 py-4">
                      {formation.chapitres && formation.chapitres.length > 0 ? (
                        <div className="space-y-3">
                          {formation.chapitres.map(chapitre => (
                            <div key={chapitre.id_chap} className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* En-tête du chapitre */}
                              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => toggleChapterExpansion(chapitre.id_chap)}
                                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                    >
                                      {expandedChapters.has(chapitre.id_chap) ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </button>
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-gray-900">{chapitre.titre_chap}</span>
                                    <span className="text-sm text-gray-500">(Ordre: {chapitre.ordre})</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>{chapitre.duree}</span>
                                    <span className="text-gray-400">|</span>
                                    <span>{chapitre.type}</span>
                                    {user?.role === 'formateur' && (
                                      <button
                                        onClick={() => handleDeleteChapter(chapitre)}
                                        className="ml-3 p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        title="Supprimer le chapitre"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Ressources du chapitre */}
                              {expandedChapters.has(chapitre.id_chap) && chapitre.ressources && chapitre.ressources.length > 0 && (
                                <div className="px-4 py-3">
                                  <div className="space-y-2">
                                    {chapitre.ressources.map(ressource => (
                                      <div key={ressource.id_res} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                          {getResourceIcon(ressource.type)}
                                          <div>
                                            <div className="font-medium text-gray-900">
                                              {ressource.nom_fichier || 'Fichier sans nom'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              {ressource.type.toUpperCase()} • {ressource.taille_fichier ? `${(ressource.taille_fichier / 1024 / 1024).toFixed(2)} MB` : 'Taille inconnue'}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {ressource.url.startsWith('/uploads/') ? (
                                            <a
                                              href={`http://localhost:3001${ressource.url}`}
                                              download
                                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Télécharger"
                                            >
                                              <Download className="w-4 h-4" />
                                            </a>
                                          ) : (
                                            <a
                                              href={ressource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                              title="Ouvrir le lien"
                                            >
                                              <ExternalLink className="w-4 h-4" />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Message si pas de ressources */}
                              {expandedChapters.has(chapitre.id_chap) && (!chapitre.ressources || chapitre.ressources.length === 0) && (
                                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                  Pas de ressources dans ce chapitre
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Aucun chapitre</p>
                          <p className="text-sm">Ajoutez des chapitres pour commencer</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Contrôles de pagination */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {`${startIndex + 1}–${Math.min(endIndex, filteredFormations.length)} sur ${filteredFormations.length}`}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Bouton précédent */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Précédent
                  </button>
                  
                  {/* Numéros de pages */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Afficher seulement quelques pages autour de la page courante
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                              page === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  {/* Bouton suivant */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de prévisualisation d'image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={`http://localhost:3001${selectedImage}`}
              alt="Prévisualisation de l'image"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}