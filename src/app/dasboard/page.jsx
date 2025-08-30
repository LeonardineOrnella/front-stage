'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formationService } from '../../service/formation.service';
import { 
  BookOpen, 
  Users, 
  Layers, 
  TrendingUp, 
  Calendar, 
  Clock, 
  DollarSign, 
  Plus,
  ArrowRight,
  FileText,
  Video,
  Image as ImageIcon
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalFormations: 0,
    activeFormations: 0,
    totalCategories: 0,
    totalChapitres: 0,
    totalRessources: 0,
    recentFormations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les formations
      const formations = await formationService.getAllFormations();
      const categories = await formationService.getCategories();
      
      // Calculer les statistiques
      const totalChapitres = formations.reduce((total, formation) => 
        total + (formation.chapitres?.length || 0), 0
      );
      
      const totalRessources = formations.reduce((total, formation) => 
        total + formation.chapitres?.reduce((chapTotal, chapitre) => 
          chapTotal + (chapitre.ressources?.length || 0), 0
        ) || 0, 0
      );
      
      const recentFormations = formations
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);

      setStats({
        totalFormations: formations.length,
        activeFormations: formations.filter(f => f.statut_form === 'Active').length,
        totalCategories: categories.length,
        totalChapitres,
        totalRessources,
        recentFormations
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormation = () => {
    router.push('/dasboard/formation/create');
  };

  const handleViewFormations = () => {
    router.push('/dasboard/formation');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header du dashboard */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-emerald-100 text-lg">Bienvenue sur votre espace de gestion des formations</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateFormation}
              className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle Formation</span>
            </button>
            <button
              onClick={handleViewFormations}
              className="bg-emerald-700/50 hover:bg-emerald-700/70 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 border border-emerald-400/30"
            >
              <span>Voir toutes</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Formations */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Formations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFormations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Gestion complète</span>
          </div>
        </div>

        {/* Formations Actives */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Formations Actives</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeFormations}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="text-green-600 font-medium">Disponibles</span>
          </div>
        </div>

        {/* Total Catégories */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Catégories</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>Organisation</span>
          </div>
        </div>

        {/* Total Chapitres */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chapitres</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalChapitres}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>Contenu structuré</span>
          </div>
        </div>
      </div>

      {/* Statistiques des ressources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des ressources */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Ressources</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-700">Documents PDF</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {stats.recentFormations.reduce((total, formation) => 
                  total + formation.chapitres?.reduce((chapTotal, chapitre) => 
                    chapTotal + (chapitre.ressources?.filter(r => r.type === 'pdf').length || 0), 0
                  ) || 0, 0
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Vidéos</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {stats.recentFormations.reduce((total, formation) => 
                  total + formation.chapitres?.reduce((chapTotal, chapitre) => 
                    chapTotal + (chapitre.ressources?.filter(r => r.type === 'video').length || 0), 0
                  ) || 0, 0
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">Images de couverture</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats.recentFormations.filter(f => f.image_couverture).length}
              </span>
            </div>
          </div>
        </div>

        {/* Formations récentes */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Formations Récentes</h3>
            <button
              onClick={handleViewFormations}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {stats.recentFormations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune formation créée</p>
            ) : (
              stats.recentFormations.map((formation, index) => (
                <div key={formation.id_form} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formation.titre_form}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formation.chapitres?.length || 0} chapitre(s) • {formation.statut_form}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/dasboard/formation/edit/${formation.id_form}`)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors duration-150"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleCreateFormation}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center group"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700 group-hover:text-blue-600">Créer une formation</p>
          </button>
          
          <button
            onClick={() => router.push('/dasboard/categorie')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-center group"
          >
            <Layers className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700 group-hover:text-purple-600">Gérer les catégories</p>
          </button>
          
          <button
            onClick={() => router.push('/dasboard/chapitre')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 text-center group"
          >
            <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-orange-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700 group-hover:text-orange-600">Gérer les chapitres</p>
          </button>
        </div>
      </div>
    </div>
  );
}
