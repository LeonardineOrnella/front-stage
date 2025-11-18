"use client"
import { getFormationProgressPercent, getSavedProgress } from "@/hooks/useProgression"
import { useEffect, useState } from "react"

export default function ProgressIndicator({ 
  formationId, 
  chapitres, 
  label = "Progression",
  // Si fourni, on force l'affichage à cette valeur (ex: valeur serveur)
  initialPercent,
  completedByChapter = {},
  completedResourcesByChapter = {},
  chapterResources = {}
}) {
  const [percent, setPercent] = useState(0);
  
  useEffect(() => {
    // Si une valeur initiale est fournie (ex: depuis serveur), on la priorise
    if (typeof initialPercent === 'number' && !Number.isNaN(initialPercent)) {
      setPercent(Math.max(0, Math.min(100, Math.round(initialPercent))));
      return;
    }

    // Si les données de progression détaillées sont passées en props, on les utilise
    // Sinon, on lit depuis localStorage
    let calculatedPercent = 0;
    
    if (Object.keys(completedByChapter).length > 0 || Object.keys(completedResourcesByChapter).length > 0) {
      // Calculer avec les données passées en props
      let totalResources = 0;
      let viewedResources = 0;
      
      if (Array.isArray(chapitres) && chapitres.length > 0) {
        const chapterIds = chapitres.map((c) => (c.id_chap || c.id || c.chapitre_id || c.ID)).filter(Boolean);
        for (const cid of chapterIds) {
          const resources = chapterResources[cid] || [];
          const chapterResourceCount = resources.length;
          totalResources += chapterResourceCount;
          viewedResources += Object.values(completedResourcesByChapter[cid] || {}).filter(Boolean).length;
        }
      }
      
      if (totalResources === 0) {
        // Fallback sur les chapitres terminés
        let completedCount = 0;
        if (Array.isArray(chapitres) && chapitres.length > 0) {
          const chapterIds = chapitres.map((c) => (c.id_chap || c.id || c.chapitre_id || c.ID)).filter(Boolean);
          for (const cid of chapterIds) {
            if (completedByChapter[cid]?.completed) completedCount++;
          }
        } else {
          completedCount = Object.values(completedByChapter).filter((v) => !!(v && v.completed)).length;
        }
        const denom = chapitres.length > 0 ? chapitres.length : Math.max(completedCount, 1);
        calculatedPercent = Math.round((completedCount / denom) * 100);
      } else {
        calculatedPercent = Math.round((viewedResources / totalResources) * 100);
      }
    } else {
      // Fallback sur localStorage
      // 1) Nouveau format clé locale: `progress:formation:${id}` avec { lastPercent }
      try {
        const key = `progress:formation:${formationId}`;
        const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.lastPercent === 'number') {
            calculatedPercent = Math.max(0, Math.min(100, Math.round(parsed.lastPercent)));
          }
        }
      } catch {}
      // 2) Ancien fallback si pas de nouveau format
      if (calculatedPercent === 0) {
        calculatedPercent = getFormationProgressPercent(formationId, chapitres);
      }
    }
    
    setPercent(calculatedPercent);
  }, [formationId, chapitres, completedByChapter, completedResourcesByChapter, chapterResources, initialPercent]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium text-gray-800">{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}


