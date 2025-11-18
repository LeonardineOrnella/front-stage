'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getQcms } from '@/service/quiz.service';
import { transactionService } from '@/service/transaction.service';
import { ResultatService } from '@/service/resultat.service';
import { toast } from 'react-toastify';
import { BookOpen, Clock, Play, CheckCircle, Award, Search, Filter } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qcms, setQcms] = useState([]);
  const [userResults, setUserResults] = useState({});
  const [userFormations, setUserFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, completed, locked

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les QCM
      const qcmsResponse = await getQcms();
      const qcmsData = Array.isArray(qcmsResponse?.data) ? qcmsResponse.data : (Array.isArray(qcmsResponse) ? qcmsResponse : []);
      setQcms(qcmsData);

      // Charger les résultats de l'utilisateur
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Charger les formations de l'utilisateur
        try {
          const formationsRes = await transactionService.getUserTransactions(user.id);
          const formations = Array.isArray(formationsRes?.data?.data) ? formationsRes.data.data : [];
          const validatedFormations = formations.filter(t => String(t.statut_trans).toLowerCase() === 'validee');
          setUserFormations(validatedFormations);

          // Charger les résultats existants
          const results = {};
          for (const qcm of qcmsData) {
            try {
              const resultRes = await ResultatService.getNoteByQcm(user.id, qcm.id_qcm);
              results[qcm.id_qcm] = resultRes.data;
            } catch {
              // Pas de résultat pour ce QCM
            }
          }
          setUserResults(results);
        } catch (error) {
          console.error('Erreur chargement données utilisateur:', error);
        }
      }
    } catch (error) {
      console.error('Erreur chargement QCM:', error);
      toast.error('Échec du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getQcmStatus = (qcm) => {
    const userData = localStorage.getItem('user');
    if (!userData) return 'locked';

    const user = JSON.parse(userData);
    const userResult = userResults[qcm.id_qcm];
    
    if (userResult) {
      return 'completed';
    }

    // Vérifier si l'utilisateur a accès à la formation associée
    if (qcm.id_form) {
      const hasAccess = userFormations.some(f => Number(f.id_form) === Number(qcm.id_form));
      return hasAccess ? 'available' : 'locked';
    }

    return 'available';
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { 
          label: 'Terminé', 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle 
        };
      case 'available':
        return { 
          label: 'Disponible', 
          color: 'bg-blue-100 text-blue-800', 
          icon: Play 
        };
      case 'locked':
        return { 
          label: 'Verrouillé', 
          color: 'bg-gray-100 text-gray-800', 
          icon: Award 
        };
      default:
        return { 
          label: 'Inconnu', 
          color: 'bg-gray-100 text-gray-800', 
          icon: Award 
        };
    }
  };

  const filteredQcms = qcms.filter(qcm => {
    const matchesSearch = qcm.titre_qcm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         qcm.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const status = getQcmStatus(qcm);
    if (filterStatus === 'all') return true;
    return status === filterStatus;
  });

  const handleStartQuiz = (qcm) => {
    const status = getQcmStatus(qcm);
    if (status === 'locked') {
      toast.error('Inscription à la formation requise');
      return;
    }
    if (status === 'completed') {
      toast.info('QCM déjà complété');
      return;
    }
    router.push(`/dasboard/apprenant/quiz/${qcm.id_qcm}`);
  };

  const handleViewResults = (qcm) => {
    router.push(`/dasboard/resultats?qcm=${qcm.id_qcm}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mes Evaluations</h1>
          <p className="text-gray-600 mt-2">Entraînez-vous et évaluez vos connaissances</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
                <p className="text-2xl font-bold text-gray-900">{qcms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Terminés</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {qcms.filter(q => getQcmStatus(q) === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Disponible</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {qcms.filter(q => getQcmStatus(q) === 'available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Award className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Verrouillé</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {qcms.filter(q => getQcmStatus(q) === 'locked').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={'Rechercher un QCM...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="available">Disponible</option>
                <option value="completed">Terminés</option>
                <option value="locked">Verrouillé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        {filteredQcms.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun QCM trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Essayez d\'autres filtres ou termes de recherche.'
                : 'Aucun QCM disponible pour le moment.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQcms.map((qcm) => {
              const status = getQcmStatus(qcm);
              const statusInfo = getStatusInfo(status);
              const StatusIcon = statusInfo.icon;
              const userResult = userResults[qcm.id_qcm];

              return (
                <div key={qcm.id_qcm} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {qcm.titre_qcm}
                        </h3>
                        {qcm.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {qcm.description}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Durée: {qcm.duree_qcm || 'Non précisée'}
                      </div>
                      {qcm.nombre_questions && (
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {qcm.nombre_questions} questions
                        </div>
                      )}
                      {userResult && (
                        <div className="flex items-center text-sm text-green-600">
                          <Award className="w-4 h-4 mr-2" />
                          Score: {userResult.note}/20
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {status === 'available' && (
                        <button
                          onClick={() => handleStartQuiz(qcm)}
                          className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Commencer
                        </button>
                      )}
                      {status === 'completed' && (
                        <button
                          onClick={() => handleViewResults(qcm)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Voir les résultats
                        </button>
                      )}
                      {status === 'locked' && (
                        <button
                          disabled
                          className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Verrouillé
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
