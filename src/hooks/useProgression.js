import { useState, useEffect } from 'react';

export const useProgression = () => {
  const [progression, setProgression] = useState(0);

  // Charger la progression depuis localStorage au montage
  useEffect(() => {
    const loadProgression = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        if (userId) {
          const savedProgression = localStorage.getItem(`progression_${userId}`);
          if (savedProgression) {
            setProgression(JSON.parse(savedProgression));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      }
    };

    loadProgression();
  }, []);

  // Fonction pour mettre à jour la progression
  const updateProgression = (newProgression) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      if (userId && newProgression >= 0 && newProgression <= 100) {
        localStorage.setItem(`progression_${userId}`, JSON.stringify(newProgression));
        setProgression(newProgression);
        
        // Notifier le dashboard si la fonction globale existe
        if (window.updateUserProgression) {
          window.updateUserProgression(newProgression);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
    }
  };

  // Fonction pour augmenter la progression
  const incrementProgression = (increment = 1) => {
    const newProgression = Math.min(100, progression + increment);
    updateProgression(newProgression);
  };

  // Fonction pour réinitialiser la progression
  const resetProgression = () => {
    updateProgression(0);
  };

  return {
    progression,
    updateProgression,
    incrementProgression,
    resetProgression
  };
};

// Fonction pour obtenir la progression d'une formation spécifique basée sur les ressources
export const getFormationProgressPercent = (formationId, chapitres = []) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (!userId || !formationId) return 0;

    const savedProgress = localStorage.getItem(`formation_progress_${userId}_${formationId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      return progress.percent || 0;
    }

    // Calculer basé sur les ressources consultées dans les chapitres
    if (chapitres.length > 0) {
    let totalResources = 0;
    let viewedResources = 0;

      for (const chapitre of chapitres) {
        const chapterId = chapitre.id_chap || chapitre.id || chapitre.chapitre_id || chapitre.ID;
        const resources = chapitre.ressources || [];
        
        totalResources += resources.length;
        
        // Compter les ressources vues pour ce chapitre
        const resourceProgressKey = `resource_progress_${userId}_${chapterId}`;
        const resourceProgress = localStorage.getItem(resourceProgressKey);
        
        if (resourceProgress) {
          const progressData = JSON.parse(resourceProgress);
          viewedResources += Object.values(progressData).filter(resource => resource.viewed).length;
        }
      }
      
      // Si pas de ressources, calculer basé sur les chapitres terminés
    if (totalResources === 0) {
        const completedChapters = chapitres.filter(chap => {
          const chapterId = chap.id_chap || chap.id || chap.chapitre_id || chap.ID;
          const chapterProgress = localStorage.getItem(`chapter_progress_${userId}_${chapterId}`);
          return chapterProgress && JSON.parse(chapterProgress).completed;
        }).length;

        return Math.round((completedChapters / chapitres.length) * 100);
    }

    return Math.round((viewedResources / totalResources) * 100);
    }

    return 0;
  } catch (error) {
    console.error('Erreur lors du calcul de la progression de formation:', error);
    return 0;
  }
};

// Fonction pour obtenir la progression sauvegardée d'une formation
export const getSavedProgress = (formationId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (!userId || !formationId) return null;

    const savedProgress = localStorage.getItem(`formation_progress_${userId}_${formationId}`);
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression sauvegardée:', error);
    return null;
  }
};

// Fonction pour sauvegarder la progression d'une formation
export const saveFormationProgress = (formationId, progressData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (!userId || !formationId) return false;

    localStorage.setItem(`formation_progress_${userId}_${formationId}`, JSON.stringify(progressData));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la progression:', error);
    return false;
  }
};

// Fonction pour marquer un chapitre comme terminé
export const markChapterCompleted = (chapterId, completed = true) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (!userId || !chapterId) return false;

    const progressData = {
      completed,
      completedAt: completed ? new Date().toISOString() : null
    };

    localStorage.setItem(`chapter_progress_${userId}_${chapterId}`, JSON.stringify(progressData));
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chapitre:', error);
    return false;
  }
};

// Fonction pour marquer une ressource comme vue
export const markResourceViewed = (chapterId, resourceId, viewed = true) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (!userId || !chapterId || !resourceId) return false;

    const key = `resource_progress_${userId}_${chapterId}`;
    const existingData = localStorage.getItem(key);
    const resourceProgress = existingData ? JSON.parse(existingData) : {};
    
    resourceProgress[resourceId] = {
      viewed,
      viewedAt: viewed ? new Date().toISOString() : null
    };

    localStorage.setItem(key, JSON.stringify(resourceProgress));
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la ressource:', error);
    return false;
  }
};

// Fonction pour calculer la progression globale de l'utilisateur
export const calculateGlobalProgress = (formationsInscrites = []) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (!userId || formationsInscrites.length === 0) return 0;

    let totalProgression = 0;
    let formationsAvecProgression = 0;

    for (const formation of formationsInscrites) {
      const formationId = formation.id_form || formation.id;
      const formationProgress = localStorage.getItem(`formation_progress_${userId}_${formationId}`);
      
      if (formationProgress) {
        const progressData = JSON.parse(formationProgress);
        if (progressData.percent !== undefined) {
          totalProgression += progressData.percent;
          formationsAvecProgression++;
        }
      }
    }

    return formationsAvecProgression > 0 ? Math.round(totalProgression / formationsAvecProgression) : 0;
  } catch (error) {
    console.error('Erreur lors du calcul de la progression globale:', error);
    return 0;
  }
};

// Fonction pour mettre à jour la progression d'une formation
export const updateFormationProgress = (formationId, chapitres = []) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (!userId || !formationId) return false;

    const progressPercent = getFormationProgressPercent(formationId, chapitres);
    
    const progressData = {
      percent: progressPercent,
      updatedAt: new Date().toISOString(),
      totalChapters: chapitres.length,
      completedChapters: chapitres.filter(chap => {
        const chapterId = chap.id_chap || chap.id || chap.chapitre_id || chap.ID;
        const chapterProgress = localStorage.getItem(`chapter_progress_${userId}_${chapterId}`);
        return chapterProgress && JSON.parse(chapterProgress).completed;
      }).length
    };

    localStorage.setItem(`formation_progress_${userId}_${formationId}`, JSON.stringify(progressData));
    
    // Mettre à jour la progression globale
    const globalProgress = calculateGlobalProgress();
    localStorage.setItem(`progression_${userId}`, JSON.stringify(globalProgress));
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression de formation:', error);
    return false;
  }
};