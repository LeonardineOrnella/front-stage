"use client";

import { useEffect, useState } from "react";
import { formationService } from "@/service/formation.service";
import { transactionService } from "@/service/transaction.service";
import { ResultatService } from "@/service/resultat.service";
import { getQcms } from "@/service/quiz.service";
import api from "@/lib/axios";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
 

export default function Page() {
  const [reco, setReco] = useState([]);
  const [formationsInscrites, setFormationsInscrites] = useState(new Set());
  const [dashboardData, setDashboardData] = useState({
    coursInscrits: 0,
    quizAvenir: 0,
    progressionMoyenne: 0,
    certificatsObtenus: 0,
    loading: true
  });

  // Fonction pour mettre à jour la progression (peut être appelée depuis d'autres composants)
  const updateProgression = (newProgression) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (userId) {
      localStorage.setItem(`progression_${userId}`, JSON.stringify(newProgression));
      setDashboardData(prev => ({
        ...prev,
        progressionMoyenne: newProgression
      }));
    }
  };

  // Exposer la fonction globalement pour qu'elle puisse être utilisée depuis d'autres pages
  useEffect(() => {
    window.updateUserProgression = updateProgression;
    return () => {
      delete window.updateUserProgression;
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les données du tableau de bord
        await loadDashboardData();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    loadData();
  }, []);

  // Charger les recommandations une fois que formationsInscrites est disponible
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Charger toutes les formations
        const list = await formationService.getAllFormations();
        const allFormations = Array.isArray(list) ? list : [];
        
        // Filtrer pour n'afficher que les formations où l'utilisateur est inscrit
        const formationsInscritesList = allFormations.filter(f => 
          formationsInscrites.has(Number(f.id_form))
        );
        
        setReco(formationsInscritesList.slice(0, 6));
      } catch (error) {
        console.error('Erreur lors du chargement des recommandations:', error);
      }
    };
    
    // Charger les recommandations seulement si formationsInscrites a été initialisé
    // (même s'il est vide, cela signifie que les données ont été chargées)
    loadRecommendations();
  }, [formationsInscrites]);

  const loadDashboardData = async () => {
    try {
      // Récupérer l'utilisateur connecté
      const userResponse = await api.get("/users/me");
      const currentUserId = userResponse.data.id;

      // Récupérer les transactions de l'utilisateur (cours inscrits)
      const transactionsResponse = await transactionService.getMyTransactions();
      const transactions = transactionsResponse.data?.data || [];
      const coursInscrits = transactions.filter(t => t.statut_trans === 'Validee').length;
      
      // Stocker les IDs des formations où l'utilisateur est inscrit
      const formationsInscritesIds = new Set(
        transactions
          .filter(t => String(t.statut_trans || '').toLowerCase() === 'validee')
          .map(t => Number(t.id_form))
          .filter(Boolean)
      );
      setFormationsInscrites(formationsInscritesIds);

      // Récupérer les quiz disponibles
      const quizResponse = await getQcms();
      const quizData = quizResponse?.data || [];
      const quizAvenir = quizData.length;

      // Récupérer les résultats pour calculer la progression
      const resultatsResponse = await ResultatService.getAll();
      const allResultats = resultatsResponse?.data || [];
      
      // Filtrer les résultats de l'utilisateur connecté
      const resultats = allResultats.filter(r => r.id === currentUserId);
      
      // Calculer la progression basée sur les ressources consultées dans les formations
      let progressionMoyenne = 0;
      
      // Récupérer toutes les formations de l'utilisateur
      const formationsInscrites = transactions.filter(t => t.statut_trans === 'Validee');
      
      if (formationsInscrites.length > 0) {
        let totalProgression = 0;
        let formationsAvecProgression = 0;
        
        for (const transaction of formationsInscrites) {
          const formationId = transaction.id_form;
          
          // Récupérer la progression de cette formation depuis localStorage
          const formationProgress = localStorage.getItem(`formation_progress_${currentUserId}_${formationId}`);
          
          if (formationProgress) {
            const progressData = JSON.parse(formationProgress);
            if (progressData.percent !== undefined) {
              totalProgression += progressData.percent;
              formationsAvecProgression++;
            }
          } else {
            // Si pas de progression sauvegardée, essayer de calculer depuis les chapitres
            try {
              // Récupérer les chapitres de cette formation (vous devrez adapter selon votre API)
              const formationResponse = await formationService.getFormationById(formationId);
              const formation = formationResponse?.data;
              
              if (formation && formation.chapitres) {
                let chapitresTermines = 0;
                const totalChapitres = formation.chapitres.length;
                
                for (const chapitre of formation.chapitres) {
                  const chapterId = chapitre.id_chap || chapitre.id;
                  const chapterProgress = localStorage.getItem(`chapter_progress_${currentUserId}_${chapterId}`);
                  
                  if (chapterProgress) {
                    const chapterData = JSON.parse(chapterProgress);
                    if (chapterData.completed) {
                      chapitresTermines++;
                    }
                  }
                }
                
                const formationPercent = totalChapitres > 0 ? Math.round((chapitresTermines / totalChapitres) * 100) : 0;
                totalProgression += formationPercent;
                formationsAvecProgression++;
                
                // Sauvegarder cette progression calculée
                localStorage.setItem(`formation_progress_${currentUserId}_${formationId}`, JSON.stringify({
                  percent: formationPercent,
                  calculatedAt: new Date().toISOString()
                }));
              }
            } catch (error) {
              console.error(`Erreur lors du calcul de la progression pour la formation ${formationId}:`, error);
            }
          }
        }
        
        // Calculer la progression moyenne
        if (formationsAvecProgression > 0) {
          progressionMoyenne = Math.round(totalProgression / formationsAvecProgression);
        }
      }
      
      // Fallback sur les résultats de quiz si aucune progression de formation trouvée
      if (progressionMoyenne === 0 && resultats.length > 0) {
        const totalScore = resultats.reduce((sum, resultat) => sum + (resultat.note || 0), 0);
        progressionMoyenne = Math.round(totalScore / resultats.length);
      }

      // Récupérer la progression persistée depuis localStorage
      const savedProgression = localStorage.getItem(`progression_${currentUserId}`);
      let finalProgression = progressionMoyenne;
      
      if (savedProgression) {
        const parsedProgression = JSON.parse(savedProgression);
        // Utiliser la progression sauvegardée si elle est plus élevée que celle calculée
        // ou si aucune progression n'a été calculée (pas de résultats)
        if (parsedProgression > progressionMoyenne || resultats.length === 0) {
          finalProgression = parsedProgression;
        }
      }

      // Sauvegarder la progression finale dans localStorage
      localStorage.setItem(`progression_${currentUserId}`, JSON.stringify(finalProgression));

      // Pour les certificats, on considère les formations terminées avec une note >= 70%
      const certificatsObtenus = resultats.filter(r => r.note >= 70).length;

      setDashboardData({
        coursInscrits,
        quizAvenir,
        progressionMoyenne: finalProgression,
        certificatsObtenus,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Bienvenue sur votre espace apprenant</p>
      </div>

      {/* CTA Parcourir le catalogue */}
      <div className="bg-white border rounded-xl p-6 flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold">Découvrir de nouvelles formations</h2>
          <p className="text-sm text-gray-600">Apprenez à votre rythme</p>
        </div>
        <a href="/dasboard/apprenant/catalogue" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Voir le catalogue
        </a>
      </div>

      {/* Cartes du tableau de bord */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Cours inscrits */}
        <div className="p-6 rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Mes cours</p>
              <div className="text-2xl font-semibold text-gray-900">
                {dashboardData.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  dashboardData.coursInscrits
                )}
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span>Formations actives</span>
          </div>
        </div>

        {/* Quiz à venir */}
        <div className="p-6 rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Quiz à venir</p>
              <div className="text-2xl font-semibold text-gray-900">
                {dashboardData.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  dashboardData.quizAvenir
                )}
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-orange-500 mr-1" />
            <span>Quiz</span>
          </div>
        </div>

        {/* Progression moyenne */}
        <div className="p-6 rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Progression</p>
              <div className="text-2xl font-semibold text-gray-900">
                {dashboardData.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  `${dashboardData.progressionMoyenne}%`
                )}
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dashboardData.progressionMoyenne}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommandé pour vous</p>
          </div>
        </div>

        {/* Certificats obtenus */}
        <div className="p-6 rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Certificats</p>
              <div className="text-2xl font-semibold text-gray-900">
                {dashboardData.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  dashboardData.certificatsObtenus
                )}
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <Award className="h-4 w-4 text-yellow-500 mr-1" />
            <span>Testez vos connaissances</span>
          </div>
        </div>
      </div>

      {/* Recommandés pour vous */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recommandé pour vous</h2>
          <a href="/dasboard/apprenant/catalogue" className="text-emerald-700 hover:underline text-sm">Tout voir</a>
        </div>
        {reco.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune recommandation pour le moment</p>
        ) : (
          <div className="space-y-3">
            {reco.map((f) => (
              <div key={f.id_form} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{f.titre_form}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{f.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{f.duree_form || 'N/A'}h</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    f.frais_form && f.frais_form > 0 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {f.frais_form && f.frais_form > 0 ? `${f.frais_form}€` : 'Gratuit'}
                  </span>
                  {formationsInscrites.has(Number(f.id_form)) ? (
                    <a 
                      href={`/dasboard/apprenant/formation/${f.id_form}`}
                      className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Accéder
                    </a>
                  ) : (
                    <a 
                      href={`/dasboard/apprenant/checkout/${f.id_form}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      S'inscrire
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border">
          <h2 className="font-semibold mb-2">Mes prochains cours</h2>
          <p className="text-sm text-gray-500">Bientôt disponible</p>
        </div>
        <div className="p-4 rounded-xl bg-white border">
          <h2 className="font-semibold mb-2">Dernières notifications</h2>
          <p className="text-sm text-gray-500">Bientôt disponible</p>
        </div>
      </div>
    </div>
  )
}


