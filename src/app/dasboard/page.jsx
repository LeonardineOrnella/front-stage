'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/backoOffice/student/UserContext';
import { useRouter } from 'next/navigation';
import { formationService } from '../../service/formation.service';
import { transactionService } from '../../service/transaction.service';
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
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalFormations: 0,
    activeFormations: 0,
    totalCategories: 0,
    totalChapitres: 0,
    totalRessources: 0,
    recentFormations: []
  });
  const [loading, setLoading] = useState(true);
  const [formationsInscrites, setFormationsInscrites] = useState(new Set());

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (user?.role === 'apprenant') {
      loadFormationsInscrites();
    }
  }, [user]);

  const loadFormationsInscrites = async () => {
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

  // Accueil "vitrine" dédiée à l'apprenant
  if (user?.role === 'apprenant') {
    return (
      <div className="p-6 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-600 text-white p-8 md:p-10">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="md:max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs">Apprenant</div>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">Bienvenue sur votre espace</h1>
              <p className="mt-3 text-emerald-50 text-base md:text-lg">Continuez vos apprentissages</p>
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <a href="/dasboard/apprenant/mesCours" className="inline-flex items-center px-5 py-3 rounded-lg bg-white text-emerald-700 font-medium hover:bg-emerald-50 transition shadow-sm w-max">Mes cours</a>
              <a href="/dasboard/apprenant/catalogue" className="inline-flex items-center px-5 py-3 rounded-lg bg-emerald-700/40 border border-emerald-300/30 hover:bg-emerald-700/50 transition w-max">Voir le catalogue</a>
            </div>
          </div>
        </div>

        {/* Mise en avant formations récentes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Formations récentes</h2>
            <a href="/dasboard/apprenant/catalogue" className="text-sm text-emerald-700 hover:text-emerald-800">Voir tout</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(stats.recentFormations || []).slice(0, 6).map((f) => {
              const coverRaw = f.image_couverture || '';
              const cover = typeof coverRaw === 'string'
                ? (coverRaw.startsWith('http://') || coverRaw.startsWith('https://')
                    ? coverRaw
                    : (coverRaw.startsWith('/uploads')
                        ? `http://localhost:3001${coverRaw}`
                        : `http://localhost:3001/uploads/couvertures/${coverRaw}`))
                : '';
              const isFree = !f.frais_form || Number(f.frais_form) === 0;
              return (
                <div key={f.id_form} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
                  {cover ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={cover} alt={f.titre_form} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                      <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-white/90 text-gray-700 border">{f.chapitres?.length || 0} chapitres</div>
                      <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${isFree ? 'bg-emerald-600 text-white' : 'bg-white/90 text-gray-800 border'}`}>{isFree ? 'Gratuit' : `${f.frais_form} €`}</div>
                    </div>
                  ) : null}
                  <div className="p-5 flex-1">
                    <div className="text-xs text-gray-500 mb-1">Formation</div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{f.titre_form}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{f.description || 'Aucune description fournie'}</p>
                  </div>
                  <div className="p-5 pt-0 flex items-center gap-3">
                    {formationsInscrites.has(Number(f.id_form)) ? (
                      <a href={`/dasboard/apprenant/formation/${f.id_form}`} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition">Accéder</a>
                    ) : (
                      <a href={`/dasboard/apprenant/checkout/${f.id_form}`} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">S'inscrire</a>
                    )}
                  </div>
                </div>
              );
            })}
            {stats.recentFormations.length === 0 && (
              <div className="col-span-full text-center text-gray-500 border rounded-xl p-10 bg-white">Aucune formation trouvée</div>
            )}
          </div>
        </div>

        {/* Raccourcis utiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/dasboard/apprenant/mesCours" className="p-5 rounded-xl bg-white border hover:shadow-sm transition">
            <div className="text-sm font-medium text-gray-900">Reprendre mes cours</div>
            <div className="text-xs text-gray-500 mt-1">Reprenez là où vous vous êtes arrêté</div>
          </a>
          <a href="/dasboard/apprenant/quiz" className="p-5 rounded-xl bg-white border hover:shadow-sm transition">
            <div className="text-sm font-medium text-gray-900">Accéder aux QCM</div>
            <div className="text-xs text-gray-500 mt-1">Testez vos connaissances</div>
          </a>
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
            <p className="text-emerald-100 text-lg">Gestion des formations et statistiques</p>
          </div>
          <div className="flex space-x-3">
            {user?.role !== 'apprenant' && (
              <>
                {user?.role === 'formateur' && (
                  <>
                    <button
                      onClick={handleCreateFormation}
                      className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Nouvelle formation</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleViewFormations}
                  className="bg-emerald-700/50 hover:bg-emerald-700/70 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 border border-emerald-400/30"
                >
                  <span>Voir toutes les formations</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA Catalogue pour Apprenant */}
      {user?.role === 'apprenant' && (
        <div className="bg-white border rounded-xl p-6 flex items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold">Parcourir le catalogue</h2>
            <p className="text-sm text-gray-600">Découvrez de nouvelles formations</p>
          </div>
          <a href="/dasboard/apprenant/catalogue" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Voir le catalogue
          </a>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Formations */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total formations</p>
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
              <p className="text-sm font-medium text-gray-600">Formations actives</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeFormations}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="text-green-600 font-medium">Disponible</span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ressources</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-700">PDF</span>
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
                <span className="font-medium text-gray-700">Couvertures</span>
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
            <h3 className="text-lg font-semibold text-gray-900">Dernières formations</h3>
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
              <p className="text-gray-500 text-center py-4">Aucune formation récente</p>
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
                      {formation.chapitres?.length || 0} chapitres • {formation.statut_form}
                    </p>
                  </div>
                  {user?.role !== 'apprenant' && (
                    <button
                      onClick={() => router.push(`/dasboard/formation/edit/${formation.id_form}`)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors duration-150"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides (masquées pour apprenant) */}
      {user?.role === 'formateur' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateFormation}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center group"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-700 group-hover:text-blue-600">Créer une formation</p>
            </button>
            
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/dasboard/categorie')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-center group"
              >
                <Layers className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-gray-700 group-hover:text-purple-600">Gérer les catégories</p>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
