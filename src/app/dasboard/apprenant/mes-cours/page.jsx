'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Play, CheckCircle, Award, Download, Eye, BarChart3 } from 'lucide-react';
import { userService } from '@/service/user.service';
import { toast } from 'react-toastify';

export default function MesCoursPage() {
  const [mesFormations, setMesFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('en-cours');

  useEffect(() => {
    loadMesFormations();
  }, []);

  const loadMesFormations = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      
      // Simuler des données pour la démonstration
      const mockData = [
        {
          id_form: 1,
          titre_form: "Formation React Avancé",
          description: "Maîtrisez React avec hooks et contexte",
          progression: 75,
          statut: "en-cours",
          duree_form: 40,
          chapitres_termines: 6,
          chapitres_total: 8,
          date_inscription: "2024-01-15",
          derniere_activite: "2024-01-20",
          certificat_disponible: false
        },
        {
          id_form: 2,
          titre_form: "JavaScript ES6+",
          description: "Les nouvelles fonctionnalités de JavaScript",
          progression: 100,
          statut: "termine",
          duree_form: 25,
          chapitres_termines: 5,
          chapitres_total: 5,
          date_inscription: "2023-12-01",
          date_completion: "2024-01-10",
          certificat_disponible: true
        },
        {
          id_form: 3,
          titre_form: "Node.js et Express",
          description: "Développement backend avec Node.js",
          progression: 30,
          statut: "en-cours",
          duree_form: 35,
          chapitres_termines: 2,
          chapitres_total: 7,
          date_inscription: "2024-01-18",
          derniere_activite: "2024-01-19",
          certificat_disponible: false
        }
      ];

      setMesFormations(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      toast.error('Erreur lors du chargement de vos formations');
    } finally {
      setLoading(false);
    }
  };

  const handleContinuerFormation = async (formationId) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      await userService.suivreFormation(user.id, formationId);
      toast.success('Redirection vers la formation...');
    } catch (error) {
      console.error('Erreur lors de l\'accès à la formation:', error);
      toast.error('Erreur lors de l\'accès à la formation');
    }
  };

  const handleTelechargerCertificat = async (formationId) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const certificat = await userService.telechargerCertificat(user.id, formationId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([certificat]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificat-formation-${formationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Certificat téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du certificat');
    }
  };

  const getProgressColor = (progression) => {
    if (progression >= 80) return 'bg-green-500';
    if (progression >= 50) return 'bg-blue-500';
    if (progression >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'termine':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en-cours':
        return <Play className="w-5 h-5 text-blue-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredFormations = mesFormations.filter(formation => {
    if (selectedTab === 'en-cours') return formation.statut === 'en-cours';
    if (selectedTab === 'terminees') return formation.statut === 'termine';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Formations</h1>
          <p className="text-gray-600">Suivez votre progression et accédez à vos cours</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Formations</p>
                <p className="text-3xl font-bold text-gray-900">{mesFormations.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-3xl font-bold text-blue-600">
                  {mesFormations.filter(f => f.statut === 'en-cours').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-3xl font-bold text-green-600">
                  {mesFormations.filter(f => f.statut === 'termine').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificats</p>
                <p className="text-3xl font-bold text-purple-600">
                  {mesFormations.filter(f => f.certificat_disponible).length}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('toutes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'toutes'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Toutes ({mesFormations.length})
              </button>
              <button
                onClick={() => setSelectedTab('en-cours')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'en-cours'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                En cours ({mesFormations.filter(f => f.statut === 'en-cours').length})
              </button>
              <button
                onClick={() => setSelectedTab('terminees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'terminees'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Terminées ({mesFormations.filter(f => f.statut === 'termine').length})
              </button>
            </nav>
          </div>
        </div>

        {/* Liste des formations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFormations.map((formation) => (
            <div key={formation.id_form} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header de la carte */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(formation.statut)}
                      <h3 className="text-xl font-bold text-gray-900">
                        {formation.titre_form}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">{formation.description}</p>
                    
                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progression</span>
                        <span className="text-sm font-medium text-gray-900">{formation.progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(formation.progression)}`}
                          style={{ width: `${formation.progression}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formation.duree_form}h de contenu</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{formation.chapitres_termines}/{formation.chapitres_total} chapitres</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4" />
                    <span>Inscrit le {new Date(formation.date_inscription).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {formation.derniere_activite && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>Vu le {new Date(formation.derniere_activite).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {formation.statut === 'en-cours' && (
                      <button
                        onClick={() => handleContinuerFormation(formation.id_form)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Continuer
                      </button>
                    )}
                    {formation.statut === 'termine' && (
                      <button
                        onClick={() => handleContinuerFormation(formation.id_form)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Revoir
                      </button>
                    )}
                  </div>
                  
                  {formation.certificat_disponible && (
                    <button
                      onClick={() => handleTelechargerCertificat(formation.id_form)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Certificat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucune formation */}
        {filteredFormations.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTab === 'en-cours' ? 'Aucune formation en cours' :
               selectedTab === 'terminees' ? 'Aucune formation terminée' :
               'Aucune formation inscrite'}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedTab === 'en-cours' ? 'Inscrivez-vous à une formation pour commencer votre apprentissage.' :
               selectedTab === 'terminees' ? 'Terminez vos formations en cours pour les voir ici.' :
               'Explorez notre catalogue et inscrivez-vous à une formation.'}
            </p>
            <button
              onClick={() => window.location.href = '/dasboard/apprenant/catalogue'}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Parcourir le catalogue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}