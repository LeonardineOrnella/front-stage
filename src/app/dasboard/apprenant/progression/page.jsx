'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { transactionService } from '@/service/transaction.service';
import { formationService } from '@/service/formation.service';
import { ResultatService } from '@/service/resultat.service';
import { getQcms } from '@/service/quiz.service';
import { toast } from 'react-toastify';
import api from '@/lib/axios';
import { progressionService } from '@/service/progression.service';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  BarChart3,
  CheckCircle,
  Play,
  Star,
  Users,
  FileText,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import ProgressIndicator from '@/components/backoOffice/student/ProgressIndicator';
import ProgressionTracker from '@/components/backoOffice/student/ProgressionTracker';
 

export default function ProgressionPage() {
  const router = useRouter();
  const tr = (_key, fallback) => fallback;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFormations: 0,
    formationsTerminees: 0,
    formationsEnCours: 0,
    totalQuiz: 0,
    quizReussis: 0,
    moyenneGenerale: 0,
    tempsEtude: 0,
    niveauActuel: 'Débutant'
  });
  const [formations, setFormations] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [expandedFormations, setExpandedFormations] = useState({});

  useEffect(() => {
    loadProgressionData();
  }, []);

  // Recharger automatiquement la progression quand l'onglet reprend le focus
  useEffect(() => {
    const onFocus = () => loadProgressionData();
    const onVisibility = () => { if (document.visibilityState === 'visible') loadProgressionData(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, []);

  const loadProgressionData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!token) {
        setLoading(false);
        router.push('/connexion');
        return;
      }
      if (!userData) {
        // Pas d'utilisateur connecté - données vides
        setFormations([]);
        setQuizResults([]);
        setRecentActivity([]);
        setAchievements([]);
        setStats({
          totalFormations: 0,
          formationsTerminees: 0,
          formationsEnCours: 0,
          totalQuiz: 0,
          quizReussis: 0,
          moyenneGenerale: 0,
          tempsEtude: 0,
          niveauActuel: 'Débutant'
        });
        return;
      }

      const user = JSON.parse(userData);
      
      // Charger les formations de l'utilisateur
      const formationsRes = await transactionService.getUserTransactions(user.id);
      const transactions = Array.isArray(formationsRes?.data?.data) ? formationsRes.data.data : [];
      const validatedTransactions = transactions.filter(t => String(t.statut_trans).toLowerCase() === 'validee');
      
      // Charger la progression persistée côté serveur
      let serverProgress = [];
      try {
        const progRes = await progressionService.getMy();
        serverProgress = Array.isArray(progRes?.data?.data) ? progRes.data.data : [];
      } catch {}

      // Charger les détails des formations
      const formationsWithDetails = await Promise.all(
        validatedTransactions.map(async (transaction) => {
          try {
            const formationRes = await formationService.getFormationById(transaction.id_form);
            // Normaliser quelques champs utiles
            const src = Array.isArray(formationRes?.formation) ? formationRes.formation[0] : (formationRes?.formation || formationRes?.data || formationRes);
            const fid = Number(src?.id_form ?? src?.id ?? transaction.id_form);
            let chapitres = Array.isArray(src?.chapitres) ? src.chapitres : (Array.isArray(src?.mchapitres) ? src.mchapitres : []);
            // Fallback: charger les chapitres si absents
            if (!Array.isArray(chapitres) || chapitres.length === 0) {
              try {
                const ch = await api.get(`/chapitres/formation/${fid}`);
                chapitres = Array.isArray(ch?.data?.data) ? ch.data.data : (Array.isArray(ch?.data) ? ch.data : []);
              } catch {}
            }
            // Enrichir: récupérer les ressources des premiers chapitres (limite pour éviter trop d'appels)
            try {
              if (Array.isArray(chapitres) && chapitres.length > 0) {
                const limit = Math.min(3, chapitres.length);
                for (let i = 0; i < limit; i++) {
                  const cid = chapitres[i].id_chap || chapitres[i].id || chapitres[i].chapitre_id || chapitres[i].ID;
                  if (!cid) continue;
                  try {
                    const rr = await api.get(`/ressources/chapitre/${cid}`);
                    const rlist = Array.isArray(rr?.data?.data) ? rr.data.data : (Array.isArray(rr?.data) ? rr.data : []);
                    if (Array.isArray(rlist)) {
                      chapitres[i] = { ...chapitres[i], ressources: rlist };
                    }
                  } catch {}
                }
              }
            } catch {}
            const server = serverProgress.find(p => Number(p.formation_id) === Number(fid));
            // Priorité: serveur > localStorage > 0
            let progress = typeof server?.percent === 'number' ? server.percent : calculateFormationProgress(fid, chapitres);
            if (typeof server?.percent === 'number') {
              // Sync local cache
              try {
                const key = `progress:formation:${fid}`;
                const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
                const parsed = saved ? JSON.parse(saved) : {};
                const merged = { ...parsed, lastPercent: server.percent };
                if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(merged));
              } catch {}
            }
            return {
              ...src,
              id_form: fid,
              chapitres,
              transaction: transaction,
              progress
            };
          } catch (error) {
            console.error('Erreur chargement formation:', error);
            return null;
          }
        })
      );
      
      const validFormations = formationsWithDetails.filter(f => f !== null);
      
      // Dédupliquer les formations par id_form (garder la plus récente)
      const uniqueFormations = validFormations.reduce((acc, formation) => {
        const existing = acc.find(f => f.id_form === formation.id_form);
        if (!existing) {
          acc.push(formation);
        } else {
          // Garder la formation avec la transaction la plus récente
          const existingDate = new Date(existing.transaction?.date_trans || 0);
          const currentDate = new Date(formation.transaction?.date_trans || 0);
          if (currentDate > existingDate) {
            const index = acc.findIndex(f => f.id_form === formation.id_form);
            acc[index] = formation;
          }
        }
        return acc;
      }, []);
      
      setFormations(uniqueFormations);

      // Charger les résultats des quiz
      const qcms = await getQcms();
      const qcmsData = Array.isArray(qcms?.data) ? qcms.data : [];
      
      const userResults = [];
      for (const qcm of qcmsData) {
        try {
          const resultRes = await ResultatService.getNoteByQcm(user.id, qcm.id_qcm);
          userResults.push({
            ...resultRes.data,
            qcm: qcm
          });
        } catch {
          // Pas de résultat pour ce QCM
        }
      }
      setQuizResults(userResults);

      // Calculer les statistiques
      const totalFormations = uniqueFormations.length;
      const formationsTerminees = uniqueFormations.filter(f => f.progress >= 100).length;
      const formationsEnCours = totalFormations - formationsTerminees;
      const totalQuiz = qcmsData.length;
      const quizReussis = userResults.length;
      const moyenneGenerale = userResults.length > 0 
        ? userResults.reduce((sum, r) => sum + (r.note || 0), 0) / userResults.length 
        : 0;

      // Calculer le niveau basé sur les performances
      let niveauActuel = 'Débutant';
      if (moyenneGenerale >= 16) niveauActuel = 'Expert';
      else if (moyenneGenerale >= 14) niveauActuel = 'Avancé';
      else if (moyenneGenerale >= 12) niveauActuel = 'Intermédiaire';
      else if (moyenneGenerale >= 10) niveauActuel = 'Débutant+';

      setStats({
        totalFormations,
        formationsTerminees,
        formationsEnCours,
        totalQuiz,
        quizReussis,
        moyenneGenerale: Math.round(moyenneGenerale * 10) / 10,
        tempsEtude: Math.floor(Math.random() * 50) + 20, // Simulation - à remplacer par vraie donnée
        niveauActuel
      });

      // Générer les activités récentes
      generateRecentActivity(uniqueFormations, userResults);
      
      // Générer les achievements
      generateAchievements(uniqueFormations, userResults);

    } catch (error) {
      console.error('Erreur chargement progression:', error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        toast.error('Session expirée ou accès refusé. Veuillez vous reconnecter.');
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            // conserver user si besoin, sinon: localStorage.removeItem('user')
          }
        } catch {}
        router.push('/connexion');
        return;
      }
      toast.error('Erreur lors du chargement de votre progression');
      
      // En cas d'erreur, initialiser avec des données vides
      setFormations([]);
      setQuizResults([]);
      setRecentActivity([]);
      setAchievements([]);
      setStats({
        totalFormations: 0,
        formationsTerminees: 0,
        formationsEnCours: 0,
        totalQuiz: 0,
        quizReussis: 0,
        moyenneGenerale: 0,
        tempsEtude: 0,
        niveauActuel: 'Débutant'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFormationProgress = (formationId, chapitres) => {
    try {
      const fid = Number(formationId);
      const key = `progress:formation:${fid}`;
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const totalChapitres = Array.isArray(chapitres) ? chapitres.length : 0;
      if (!saved) {
        return totalChapitres > 0 ? 0 : 0;
      }
      const parsed = JSON.parse(saved);
      const completedByChapter = parsed && typeof parsed.completedByChapter === 'object' ? parsed.completedByChapter : {};
      const lastPercent = typeof parsed.lastPercent === 'number' ? parsed.lastPercent : null;

      // Si une valeur calculée a été persistée depuis la page contenu, l'utiliser
      if (lastPercent !== null) return Math.max(0, Math.min(100, Math.round(lastPercent)));

      // Sinon, calcul basé sur chapitres terminés (persisté) pour avoir une valeur stable au rechargement
      let completedCount = 0;
      if (totalChapitres > 0) {
        const chapterIds = chapitres.map((c) => (c.id_chap || c.id || c.chapitre_id || c.ID)).filter(Boolean);
        for (const cid of chapterIds) {
          if (completedByChapter[cid]?.completed) completedCount++;
        }
      } else {
        completedCount = Object.values(completedByChapter).filter((v) => !!(v && v.completed)).length;
      }
      const denom = totalChapitres > 0 ? totalChapitres : Math.max(completedCount, 1);
      return Math.round((completedCount / denom) * 100);
    } catch {
      return 0;
    }
  };

  const getCompletedChaptersMap = (formationId) => {
    try {
      const fid = Number(formationId);
      const key = `progress:formation:${fid}`;
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      const completed = parsed && typeof parsed.completedByChapter === 'object' ? parsed.completedByChapter : {};
      return completed;
    } catch {
      return {};
    }
  };

  const continueAtChapter = (formationId, chapterIndex) => {
    try {
      const fid = Number(formationId);
      const key = `progress:formation:${fid}`;
      let saved = {};
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        if (raw) saved = JSON.parse(raw) || {};
      } catch {}
      saved.chapterIndex = Number(chapterIndex) || 0;
      saved.resourceIndex = 0;
      if (!saved.completedByChapter) saved.completedByChapter = {};
      if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(saved));
    } catch {}
    router.push(`/dasboard/apprenant/formation/${formationId}/contenu`);
  };

  const generateRecentActivity = (formations, results) => {
    const activities = [];
    
    // Activités de formations
    formations.forEach(formation => {
      activities.push({
        type: 'formation',
        title: tr('student.progress.activity.formation_title', `Formation "${formation.titre_form}"`).replace('{title}', formation.titre_form || ''),
        description: tr('student.progress.activity.progress', `Progression: ${formation.progress}%`).replace('{percent}', String(formation.progress || 0)),
        date: new Date(formation.transaction?.date_trans),
        icon: BookOpen,
        color: 'text-blue-600'
      });
    });

    // Activités de quiz
    results.forEach(result => {
      activities.push({
        type: 'quiz',
        title: tr('student.progress.activity.quiz_title', `Quiz "${result.qcm?.titre_qcm}"`).replace('{title}', result.qcm?.titre_qcm || ''),
        description: tr('student.progress.activity.score', `Note: ${result.note}/20`).replace('{score}', String(result.note || 0)),
        date: new Date(result.date_resultat),
        icon: Trophy,
        color: 'text-green-600'
      });
    });

    // Trier par date et prendre les 5 plus récents
    const sortedActivities = activities
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
    
    setRecentActivity(sortedActivities);
  };

  const generateAchievements = (formations, results) => {
    const achievements = [];

    // Achievement: Première formation
    if (formations.length >= 1) {
      achievements.push({
        id: 'first-formation',
        title: 'Premier Pas',
        description: 'Première formation commencée',
        icon: Star,
        unlocked: true,
        color: 'text-yellow-600'
      });
    }

    // Achievement: Formation terminée
    if (formations.some(f => f.progress >= 100)) {
      achievements.push({
        id: 'formation-completed',
        title: 'Finisseur',
        description: 'Première formation terminée',
        icon: CheckCircle,
        unlocked: true,
        color: 'text-green-600'
      });
    }

    // Achievement: Quiz réussi
    if (results.length >= 1) {
      achievements.push({
        id: 'quiz-master',
        title: 'Maître des Quiz',
        description: 'Premier quiz réussi',
        icon: Trophy,
        unlocked: true,
        color: 'text-purple-600'
      });
    }

    // Achievement: Bonne moyenne
    if (stats.moyenneGenerale >= 15) {
      achievements.push({
        id: 'excellent-student',
        title: 'Excellent Étudiant',
        description: 'Moyenne supérieure à 15/20',
        icon: Award,
        unlocked: true,
        color: 'text-red-600'
      });
    }

    // Achievements verrouillés
    if (formations.length < 5) {
      achievements.push({
        id: 'dedicated-learner',
        title: 'Apprenant Dédié',
        description: 'Inscrit à 5 formations',
        icon: BookOpen,
        unlocked: false,
        color: 'text-gray-400'
      });
    }

    setAchievements(achievements);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'text-red-600 bg-red-100';
      case 'Avancé': return 'text-purple-600 bg-purple-100';
      case 'Intermédiaire': return 'text-blue-600 bg-blue-100';
      case 'Débutant+': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={`loading-card-${i}`} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">{tr('student.progress.title', 'Ma Progression')}</h1>
          <p className="text-gray-600 mt-2">
            {tr('student.progress.subtitle', 'Suivez votre évolution et vos accomplissements')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tr('student.progress.enrolled', 'Formations Inscrites')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFormations}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tr('student.progress.completed_trainings', 'Formations Terminées')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.formationsTerminees}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tr('student.progress.avg_score', 'Moyenne Générale')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.moyenneGenerale}/20</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tr('student.progress.current_level', 'Niveau Actuel')}</p>
                <p className={`text-lg font-bold px-2 py-1 rounded-full ${getLevelColor(stats.niveauActuel)}`}>
                  {stats.niveauActuel}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formations en cours */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{tr('student.progress.my_trainings', 'Mes Formations')}</h2>
              </div>
    <div className="p-6">
                {formations.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{tr('student.progress.none', 'Aucune formation')}</h3>
                    <p className="text-gray-600">{tr('student.progress.none_desc', 'Inscrivez-vous à une formation pour commencer votre apprentissage')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formations.map((formation, index) => (
                      <div key={`${formation.id_form ?? 'formation'}-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {formation.titre_form}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formation.chapitres?.length || 0} chapitre(s) • {formation.duree_form || 'Durée non spécifiée'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              formation.progress >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {formation.progress >= 100 ? 'Terminé' : 'En cours'}
                            </span>
                            <button
                              onClick={() => setExpandedFormations((m) => ({ ...m, [formation.id_form]: !m[formation.id_form] }))}
                              className="text-xs px-2 py-1 rounded border hover:bg-gray-50 text-gray-700"
                            >
                              {expandedFormations[formation.id_form] ? tr('student.progress.hide_chapters', 'Masquer chapitres') : tr('student.progress.show_chapters', 'Voir chapitres')}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <ProgressIndicator 
                            formationId={formation.id_form}
                            chapitres={formation.chapitres}
                            initialPercent={formation.progress}
                          />
                        </div>
                        {/* Détail par chapitre si disponible */}
                        {expandedFormations[formation.id_form] && Array.isArray(formation.chapitres) && formation.chapitres.length > 0 && (
                          <div className="mt-3 border-t pt-3">
                            <div className="text-sm font-medium text-gray-800 mb-2">{tr('student.progress.chapters_of', 'Chapitres —')} {formation.titre_form}</div>
                            <ProgressionTracker formationId={formation.id_form} chapitres={formation.chapitres} />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {(() => {
                                const list = Array.isArray(formation.chapitres) ? formation.chapitres : [];
                                const total = list.reduce((acc, chap) => acc + (Array.isArray(chap.ressources) ? chap.ressources.length : 0), 0);
                                return total;
                              })()} ressources
                            </div>
                            <div className="flex items-center">
                              <Video className="w-4 h-4 mr-1" />
                              {(() => {
                                const list = Array.isArray(formation.chapitres) ? formation.chapitres : [];
                                const total = list.reduce((acc, chap) => {
                                  const rlist = Array.isArray(chap.ressources) ? chap.ressources : [];
                                  return acc + rlist.filter((r) => (r.type || r.type_ressource) === 'video').length;
                                }, 0);
                                return total;
                              })()} vidéos
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/dasboard/apprenant/formation/${formation.id_form}/contenu`)}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                          >
                            {tr('student.progress.continue', 'Continuer →')}
                          </button>
                        </div>

                        {/* Détail rapide: titre 1er chapitre + 1ère ressource */}
                        {Array.isArray(formation.chapitres) && formation.chapitres.length > 0 && (
                          <div className="mt-3 text-xs text-gray-600">
                            <div>
                              {tr('student.progress.chapter_1', 'Chapitre 1')}: <span className="font-medium text-gray-800">{formation.chapitres[0].titre_chap || formation.chapitres[0].titre || '—'}</span>
                            </div>
                            {Array.isArray(formation.chapitres[0].ressources) && formation.chapitres[0].ressources.length > 0 ? (
                              <div>
                                {tr('student.progress.resource', 'Ressource')}: <span className="font-medium text-gray-800">{formation.chapitres[0].ressources[0].titre || formation.chapitres[0].ressources[0].titre_res || formation.chapitres[0].ressources[0].nom_fichier || '—'}</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                        {/* fin carte formation */}
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activité récente */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{tr('student.progress.recent_activity', 'Activité Récente')}</h2>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">{tr('student.progress.no_activity', 'Aucune activité récente')}</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={`activity-${index}-${activity.type}`} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                            <Icon className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.date.toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{tr('student.progress.achievements', 'Succès')}</h2>
              </div>
              <div className="p-6">
                {achievements.length === 0 ? (
                  <p className="text-gray-500 text-sm">{tr('student.progress.no_achievements', 'Aucun succès débloqué')}</p>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      return (
                        <div key={achievement.id || `achievement-${index}`} className={`flex items-center space-x-3 p-3 rounded-lg ${
                          achievement.unlocked ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                        }`}>
                          <div className={`p-2 rounded-full ${
                            achievement.unlocked ? achievement.color.replace('text-', 'bg-').replace('-600', '-100') : 'bg-gray-200'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              achievement.unlocked ? achievement.color : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {achievement.title}
                            </p>
                            <p className={`text-xs ${
                              achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques des quiz */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{tr('student.progress.quiz_performance', 'Performance Quiz')}</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{tr('student.progress.quizzes_passed', 'Quiz Réussis')}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.quizReussis}/{stats.totalQuiz}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${stats.totalQuiz > 0 ? (stats.quizReussis / stats.totalQuiz) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.moyenneGenerale}</p>
                    <p className="text-sm text-gray-600">{tr('student.progress.avg', 'Moyenne générale')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}