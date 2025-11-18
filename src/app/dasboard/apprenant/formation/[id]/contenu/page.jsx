'use client';

import { useEffect, useMemo, useState } from 'react';
import ProgressIndicator from '@/components/backoOffice/student/ProgressIndicator';
import { useParams, useRouter } from 'next/navigation';
import { formationService } from '@/service/formation.service';
import api from '@/lib/axios';
import { progressionService } from '@/service/progression.service';
import { transactionService } from '@/service/transaction.service';

export default function FormationContentPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = useMemo(() => params?.id, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [formation, setFormation] = useState(null);
  const [chapterResources, setChapterResources] = useState({}); // id_chap -> resources[]
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
  const [completedByChapter, setCompletedByChapter] = useState({}); // chapId -> { completed: boolean }
  const [completedResourcesByChapter, setCompletedResourcesByChapter] = useState({}); // chapId -> { resId: true }

  const progressKey = useMemo(() => `progress:formation:${formationId}`, [formationId]);

  const computePercentFromState = (chaptersList, resourcesByChapter, completedByChap, completedResByChap) => {
    try {
      const chapitresArr = Array.isArray(chaptersList) ? chaptersList : [];
      let totalResources = 0;
      let viewedResources = 0;
      if (chapitresArr.length > 0) {
        const chapterIds = chapitresArr.map((c) => (c.id_chap || c.id || c.chapitre_id || c.ID)).filter(Boolean);
        for (const cid of chapterIds) {
          const resList = resourcesByChapter[cid] || [];
          totalResources += resList.length;
          viewedResources += Object.values(completedResByChap[cid] || {}).filter(Boolean).length;
        }
      }
      if (totalResources === 0) {
        // fallback: chapters completed ratio
        let completedCount = 0;
        if (chapitresArr.length > 0) {
          const chapterIds = chapitresArr.map((c) => (c.id_chap || c.id || c.chapitre_id || c.ID)).filter(Boolean);
          for (const cid of chapterIds) {
            if (completedByChap[cid]?.completed) completedCount++;
          }
        } else {
          completedCount = Object.values(completedByChap).filter((v) => !!(v && v.completed)).length;
        }
        const denom = chapitresArr.length > 0 ? chapitresArr.length : Math.max(completedCount, 1);
        return Math.round((completedCount / denom) * 100);
      }
      return Math.round((viewedResources / totalResources) * 100);
    } catch {
      return 0;
    }
  };

  // Fonction pour persister immédiatement la progression
  const persistProgressImmediately = async (newCompletedByChapter, newCompletedResourcesByChapter) => {
    try {
      const cb = newCompletedByChapter || completedByChapter;
      const cr = newCompletedResourcesByChapter || completedResourcesByChapter;
      const percent = computePercentFromState(formation?.chapitres || chapters, chapterResources, cb, cr);
      const numericId = Number(formationId);
      if (Number.isFinite(numericId) && numericId > 0) {
        await progressionService.upsertMyFormation(numericId, { percent, completedByChapter: cb });
      }
      const payload = JSON.stringify({ 
        chapterIndex: currentChapterIndex, 
        resourceIndex: currentResourceIndex, 
        completedByChapter: cb, 
        completedResourcesByChapter: cr,
        lastPercent: percent
      });
      if (typeof window !== 'undefined') localStorage.setItem(progressKey, payload);
    } catch {}
  };

  // Exiger l'authentification: rediriger vers inscription si pas de token
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/inscription');
    }
  }, [router]);

  // Restore progress
  useEffect(() => {
    if (!formationId) return;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(progressKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.chapterIndex === 'number') setCurrentChapterIndex(parsed.chapterIndex);
        if (typeof parsed.resourceIndex === 'number') setCurrentResourceIndex(parsed.resourceIndex);
        if (parsed.completedByChapter && typeof parsed.completedByChapter === 'object') setCompletedByChapter(parsed.completedByChapter);
        if (parsed.completedResourcesByChapter && typeof parsed.completedResourcesByChapter === 'object') setCompletedResourcesByChapter(parsed.completedResourcesByChapter);
      }
    } catch {}
  }, [progressKey, formationId]);

  // Persist progress
  useEffect(() => {
    if (!formationId) return;
    try {
      const payload = JSON.stringify({ chapterIndex: currentChapterIndex, resourceIndex: currentResourceIndex, completedByChapter, completedResourcesByChapter });
      if (typeof window !== 'undefined') localStorage.setItem(progressKey, payload);
    } catch {}
  }, [progressKey, formationId, currentChapterIndex, currentResourceIndex, completedByChapter, completedResourcesByChapter]);

  // Load formation and chapters
  useEffect(() => {
    if (!formationId) return;
    const numericId = Number(formationId);
    if (!Number.isFinite(numericId) || Number.isNaN(numericId) || numericId <= 0) {
      router.replace('/dasboard/apprenant/mesCours');
      return;
    }
    (async () => {
      setLoading(true);
      setError('');
      try {
        // numericId already validated above
        const raw = await formationService.getFormationById(numericId);
        const pick = (val) => Array.isArray(val) ? (val[0] || null) : val;
        const src = pick(raw?.formation || raw?.data || raw);
        let normalized = src ? {
          id_form: src.id_form ?? src.id ?? src.formation_id ?? src.ID ?? numericId,
          titre_form: src.titre_form ?? src.titre ?? src.title ?? 'Formation',
          description: src.description ?? src.resume ?? src.apercu ?? '',
          frais_form: src.frais_form ?? src.prix ?? src.price ?? 0,
          duree_form: src.duree_form ?? src.duree ?? src.duration ?? null,
          image_couverture: src.image_couverture ?? src.cover ?? src.image ?? null,
          chapitres: src.chapitres ?? src.mchapitres ?? src.chapters ?? [],
        } : null;
        // If API returned 200 but empty payload, try chapters-based fallback
        if (!normalized) {
          try {
            const chapRes0 = await api.get(`/chapitres/formation/${numericId}`);
            const chapList0 = Array.isArray(chapRes0?.data) ? chapRes0.data : (Array.isArray(chapRes0?.data?.data) ? chapRes0.data.data : []);
            if (Array.isArray(chapList0) && chapList0.length > 0) {
              normalized = {
                id_form: numericId,
                titre_form: 'Formation',
                description: '',
                frais_form: 0,
                duree_form: null,
                image_couverture: null,
                chapitres: chapList0,
              };
            }
          } catch {}
        }
        // Normalize various chapter shapes
        if (normalized && normalized.chapitres && !Array.isArray(normalized.chapitres)) {
          try {
            if (typeof normalized.chapitres === 'string') {
              const parsed = JSON.parse(normalized.chapitres);
              normalized.chapitres = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.data) ? parsed.data : (Array.isArray(parsed?.results) ? parsed.results : []));
            } else if (normalized.chapitres && typeof normalized.chapitres === 'object') {
              normalized.chapitres = Array.isArray(normalized.chapitres.data) ? normalized.chapitres.data : (Array.isArray(normalized.chapitres.results) ? normalized.chapitres.results : []);
            }
          } catch {}
        }
        // Fallback 1: fetch chapitres by normalized id_form
        if (normalized && (!Array.isArray(normalized.chapitres) || normalized.chapitres.length === 0) && normalized.id_form) {
          try {
            const chapRes = await api.get(`/chapitres/formation/${normalized.id_form}`);
            const chapList = Array.isArray(chapRes?.data) ? chapRes.data : (Array.isArray(chapRes?.data?.data) ? chapRes.data.data : []);
            normalized.chapitres = chapList;
          } catch {}
        }
        // Fallback 2: fetch chapitres by route param formationId if still empty
        if (normalized && (!Array.isArray(normalized.chapitres) || normalized.chapitres.length === 0) && formationId) {
          try {
            const chapRes2 = await api.get(`/chapitres/formation/${Number(formationId)}`);
            const chapList2 = Array.isArray(chapRes2?.data) ? chapRes2.data : (Array.isArray(chapRes2?.data?.data) ? chapRes2.data.data : []);
            normalized.chapitres = chapList2;
          } catch {}
        }
        // If still null, try searching all formations before failing
        if (!normalized) {
          try {
            const all = await formationService.getAllFormations();
            const list = Array.isArray(all?.data) ? all.data : (Array.isArray(all) ? all : []);
            const found = list.find((f) => Number(f.id_form ?? f.id ?? f.formation_id ?? f.ID) === numericId);
            if (found) {
              normalized = {
                id_form: found.id_form ?? found.id ?? numericId,
                titre_form: found.titre_form ?? found.titre ?? found.title ?? 'Formation',
                description: found.description ?? found.resume ?? found.apercu ?? '',
                frais_form: found.frais_form ?? found.prix ?? found.price ?? 0,
                duree_form: found.duree_form ?? found.duree ?? found.duration ?? null,
                image_couverture: found.image_couverture ?? found.cover ?? found.image ?? null,
                chapitres: found.chapitres ?? found.mchapitres ?? found.chapters ?? [],
              };
            }
          } catch {}
        }
        setFormation(normalized);
      } catch (e) {
        // Fallback: charger toutes les formations et trouver par id puis, si absent, essayer via chapitres
        try {
          const numericId = Number(formationId);
          const all = await formationService.getAllFormations();
          const list = Array.isArray(all?.data) ? all.data : (Array.isArray(all) ? all : []);
          const found = list.find((f) => Number(f.id_form ?? f.id ?? f.formation_id ?? f.ID) === numericId);
          if (found) {
            setFormation({
              id_form: found.id_form ?? found.id ?? numericId,
              titre_form: found.titre_form ?? found.titre ?? found.title ?? 'Formation',
              description: found.description ?? found.resume ?? found.apercu ?? '',
              frais_form: found.frais_form ?? found.prix ?? found.price ?? 0,
              duree_form: found.duree_form ?? found.duree ?? found.duration ?? null,
              image_couverture: found.image_couverture ?? found.cover ?? found.image ?? null,
              chapitres: found.chapitres ?? found.mchapitres ?? found.chapters ?? [],
            });
          } else {
            // Fallback chapitres: si des chapitres existent pour cet ID, construire une formation minimale
            try {
              const chapRes = await api.get(`/chapitres/formation/${numericId}`);
              const chapList = Array.isArray(chapRes?.data) ? chapRes.data : (Array.isArray(chapRes?.data?.data) ? chapRes.data.data : []);
              if (Array.isArray(chapList) && chapList.length > 0) {
                setFormation({
                  id_form: numericId,
                  titre_form: 'Formation',
                  description: '',
                  frais_form: 0,
                  duree_form: null,
                  image_couverture: null,
                  chapitres: chapList,
                });
              } else {
                setError(e?.message || 'Erreur de chargement de la formation');
                setFormation(null);
              }
            } catch (eChap) {
              setError(e?.message || 'Erreur de chargement de la formation');
              setFormation(null);
            }
          }
        } catch (e2) {
          // Dernier essai: chapitres par ID direct
          try {
            const chapRes = await api.get(`/chapitres/formation/${Number(formationId)}`);
            const chapList = Array.isArray(chapRes?.data) ? chapRes.data : (Array.isArray(chapRes?.data?.data) ? chapRes.data.data : []);
            if (Array.isArray(chapList) && chapList.length > 0) {
              setFormation({
                id_form: Number(formationId),
                titre_form: 'Formation',
                description: '',
                frais_form: 0,
                duree_form: null,
                image_couverture: null,
                chapitres: chapList,
              });
            } else {
              setError(e2?.message || 'Erreur de chargement de la formation');
              setFormation(null);
            }
          } catch (e3) {
            setError(e3?.message || 'Erreur de chargement de la formation');
            setFormation(null);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId]);

  // Check access
  useEffect(() => {
    if (!formationId || !formation) return;
    (async () => {
      try {
        // Pour les formations gratuites, on exige tout de même une session
        if (!formation.frais_form || formation.frais_form === 0) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (!token) {
            setHasAccess(false);
            return;
          }
          setHasAccess(true);
          return;
        }
        // Vérification robuste de l'accès: primaire + fallback
        const paid = await transactionService.checkFormationAccessRobust(formationId);
        setHasAccess(paid);
      } catch {
        setHasAccess(false);
      }
    })();
  }, [formationId, formation]);

  // Load resources per chapter
  const fetchChapterResources = async (chaptersToLoad) => {
    const result = {};
    for (const chap of chaptersToLoad) {
      const chapId = chap.id_chap || chap.id || chap.chapitre_id || chap.ID;
      if (!chapId) continue;
      try {
        const res = await api.get(`/ressources/chapitre/${chapId}`);
        const payload = res?.data;
        const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : []);
        result[chapId] = list.map((r, i) => {
          const rawUrl = r.url || r.chemin || r.path || r.fichier || r.filepath || '';
          const lowerUrl = typeof rawUrl === 'string' ? rawUrl.toLowerCase() : '';
          const guessed = lowerUrl.endsWith('.mp4') ? 'video'
            : (lowerUrl.endsWith('.pdf') ? 'pdf'
            : (lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp') ? 'image' : 'file'));
          const normalizedType = ((r.type || r.format || guessed) + '').trim().toLowerCase();
          return {
            id_res: r.id_res || r.id || i,
            titre: r.titre_res || r.titre || r.nom_fichier || r.nom || `Ressource ${i+1}`,
            type: normalizedType,
            url: rawUrl,
          };
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Erreur chargement ressources chapitre', chapId, e?.message);
        result[chapId] = [];
      }
    }
    setChapterResources(result);
    // Auto-sélectionner le premier chapitre qui a des ressources
    try {
      const firstWithResourcesIndex = chaptersToLoad.findIndex((c) => {
        const cid = c.id_chap || c.id || c.chapitre_id || c.ID;
        const list = cid ? result[cid] : [];
        return Array.isArray(list) && list.length > 0;
      });
      if (firstWithResourcesIndex >= 0) {
        setCurrentChapterIndex(firstWithResourcesIndex);
        setCurrentResourceIndex(0);
      }
    } catch {}
  };

  useEffect(() => {
    if (!Array.isArray(formation?.chapitres) || formation.chapitres.length === 0) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchChapterResources(formation.chapitres);
    })();
    return () => { cancelled = true; };
  }, [formation]);

  const chapters = formation?.chapitres || [];
  const currentChapter = chapters[currentChapterIndex] || null;
  const currentChapterId = currentChapter ? (currentChapter.id_chap || currentChapter.id || currentChapter.chapitre_id || currentChapter.ID) : null;
  const resources = (currentChapterId && chapterResources[currentChapterId]) ? chapterResources[currentChapterId] : (currentChapter?.ressources || []);
  const currentResource = resources[currentResourceIndex] || null;

  const isChapterCompleted = (chap) => {
    const cid = chap ? (chap.id_chap || chap.id || chap.chapitre_id || chap.ID) : null;
    return !!(cid && completedByChapter[cid]?.completed);
  };

  const isResourceViewed = (chapId, res) => {
    const rid = res?.id_res || res?.id;
    if (!chapId || !rid) return false;
    return !!completedResourcesByChapter[chapId]?.[rid];
  };

  const markResourceViewed = (chapId, res) => {
    const rid = res?.id_res || res?.id;
    if (!chapId || !rid) return;
    setCompletedResourcesByChapter((prev) => {
      const nextForChap = { ...(prev[chapId] || {}), [rid]: true };
      const next = { ...prev, [chapId]: nextForChap };
      // If all resources in this chapter are viewed, mark chapter as completed
      try {
        const list = chapterResources[chapId] || currentChapter?.ressources || [];
        const allViewed = Array.isArray(list) && list.length > 0 ? list.every((r) => {
          const id = r?.id_res || r?.id;
          return !!nextForChap[id];
        }) : false;
        if (allViewed) {
          setCompletedByChapter((m) => {
            const newCompletedByChapter = { ...m, [chapId]: { completed: true } };
            // Persister immédiatement
            persistProgressImmediately(newCompletedByChapter, next);
            return newCompletedByChapter;
          });
        } else {
          // Persister immédiatement même si le chapitre n'est pas terminé
          persistProgressImmediately(completedByChapter, next);
        }
      } catch {}
      return next;
    });
  };

  const buildHref = (u) => {
    let href = u || '';
    if (typeof href === 'string') {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        // already absolute
      } else if (href.startsWith('/')) {
        href = `http://localhost:3001${href}`;
      } else {
        href = `http://localhost:3001/${href}`;
      }
    }
    return href;
  };

  const goPrev = () => {
    if (!resources.length) return;
    if (currentResourceIndex > 0) {
      setCurrentResourceIndex((i) => i - 1);
      return;
    }
    if (currentChapterIndex > 0) {
      const prevChapterIndex = currentChapterIndex - 1;
      const prevChapter = chapters[prevChapterIndex];
      const prevId = prevChapter ? (prevChapter.id_chap || prevChapter.id || prevChapter.chapitre_id || prevChapter.ID) : null;
      const prevResources = prevId ? (chapterResources[prevId] || prevChapter?.ressources || []) : [];
      setCurrentChapterIndex(prevChapterIndex);
      setCurrentResourceIndex(Math.max(0, prevResources.length - 1));
    }
  };

  const goNext = () => {
    if (!resources.length) return;
    if (currentResourceIndex < resources.length - 1) {
      setCurrentResourceIndex((i) => i + 1);
      return;
    }
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((i) => i + 1);
      setCurrentResourceIndex(0);
    }
  };

  const markAsDoneAndAdvance = () => {
    // If there are resources and we are at end, mark chapter complete
    const cid = currentChapterId;
    if (resources.length === 0) {
      // No resources: mark chapter complete immediately and advance
      if (cid) {
        setCompletedByChapter((m) => {
          const newCompletedByChapter = { ...m, [cid]: { completed: true } };
          // Persister immédiatement
          persistProgressImmediately(newCompletedByChapter, completedResourcesByChapter);
          return newCompletedByChapter;
        });
      }
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex((i) => i + 1);
        setCurrentResourceIndex(0);
      }
      return;
    }
    if (currentResourceIndex < resources.length - 1) {
      setCurrentResourceIndex((i) => i + 1);
    } else {
      // last resource => complete chapter and go next
      if (cid) {
        setCompletedByChapter((m) => {
          const newCompletedByChapter = { ...m, [cid]: { completed: true } };
          // Persister immédiatement
          persistProgressImmediately(newCompletedByChapter, completedResourcesByChapter);
          return newCompletedByChapter;
        });
      }
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex((i) => i + 1);
        setCurrentResourceIndex(0);
      }
    }
  };

  const canGoToChapter = (targetIndex) => {
    if (targetIndex <= currentChapterIndex + 1) return true; // allow current and immediate next
    // otherwise allow only if all previous up to targetIndex-1 are completed
    for (let i = 0; i < targetIndex; i++) {
      const chap = chapters[i];
      if (!isChapterCompleted(chap)) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{formation?.titre_form || ''}</h1>
            {formation?.description ? (
              <p className="text-sm text-gray-600">{formation.description}</p>
            ) : null}
          </div>
          <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-800">Retour</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-600">Chargement…</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : !formation ? (
            <div className="text-center text-gray-600">Formation introuvable.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {!hasAccess && formation.frais_form ? (
                <div className="lg:col-span-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  Cette formation est payante. L'accès complet est verrouillé, mais vous pouvez consulter la liste des chapitres et des ressources.
                </div>
              ) : null}
              <aside className="lg:col-span-1 border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">Chapitres</div>
                <ul className="divide-y">
                  {chapters.map((chap, i) => {
                    const cid = chap.id_chap || chap.id || chap.chapitre_id || chap.ID || i;
                    const completed = isChapterCompleted(chap);
                    const allowed = canGoToChapter(i);
                    return (
                      <li key={cid} className={`px-4 py-3 text-sm flex items-center justify-between ${i === currentChapterIndex ? 'bg-emerald-50 text-emerald-700' : (allowed ? 'hover:bg-gray-50' : 'opacity-60')}`}
                          onClick={() => { if (allowed) { setCurrentChapterIndex(i); setCurrentResourceIndex(0); } }}>
                        <div className="font-medium">{chap.titre_chap || chap.titre || `Chapitre ${i + 1}`}</div>
                        {completed ? (
                          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </aside>

               <main className="lg:col-span-3">
                {/* Progress summary */}
                {(() => {
                  const total = chapters.length || 1;
                  const doneCount = chapters.filter((c) => isChapterCompleted(c)).length;
                  const pct = Math.round((doneCount / total) * 100);
                  return (
                  <div className="mb-3 p-3 border rounded bg-white">
                    <ProgressIndicator 
                      formationId={formation?.id_form} 
                      chapitres={chapters} 
                      label="Suivi d'apprentissage"
                      completedByChapter={completedByChapter}
                      completedResourcesByChapter={completedResourcesByChapter}
                      chapterResources={chapterResources}
                    />
                  </div>
                  );
                })()}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Chapitre {currentChapterIndex + 1} / {chapters.length}</div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentChapter?.titre_chap || currentChapter?.titre || 'Chapitre'}</h2>
                    {(() => {
                      const raw = currentChapter?.drive_link || currentChapter?.drive || currentChapter?.lien_drive || currentChapter?.lien || currentChapter?.url_drive || '';
                      const href = typeof raw === 'string' && raw.includes('drive.google') ? raw : '';
                      if (!href) return null;
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 mt-2 text-sm text-emerald-700 hover:text-emerald-800"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4h6m0 0v6m0-6L10 14"/></svg>
                          Lien Drive du chapitre
                        </a>
                      );
                    })()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={goPrev} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">Précédent</button>
                    <button onClick={goNext} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">Suivant</button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  {/* Progress bar */}
                  <div className="mb-3">
                    {(() => {
                      const total = chapters.length || 1;
                      const doneCount = chapters.filter((c) => isChapterCompleted(c)).length;
                      const pct = Math.round((doneCount / total) * 100);
                      return (
                        <div>
                          <div className="h-2 bg-gray-100 rounded">
                            <div className="h-2 bg-emerald-500 rounded" style={{ width: `${pct}%` }}></div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">Progression: {pct}%</div>
                        </div>
                      );
                    })()}
                  </div>

                   {!hasAccess ? (
                     <div className="text-sm text-gray-600">
                       Accès verrouillé. Veuillez vous inscrire et/ou attendre la validation de votre paiement.
                     </div>
                   ) : (
                     <div className="space-y-4">
                       {resources.length === 0 ? (
                         <div className="text-sm text-gray-500">Aucune ressource dans ce chapitre.</div>
                       ) : (
                         <>
                           {/* Liste des ressources du chapitre courant */}
                           <div>
                             <div className="text-sm font-medium text-gray-800 mb-2">Ressources du chapitre</div>
                             <ul className="divide-y rounded border">
                               {resources.map((r, idx) => {
                                 const isActive = idx === currentResourceIndex;
                                 return (
                                   <li key={r.id_res || r.id || idx} className={`px-3 py-2 text-sm flex items-center justify-between ${isActive ? 'bg-emerald-50' : 'bg-white'}`}>
                                     <div className="min-w-0">
                                       <div className="truncate text-gray-800">
                                         {r.titre || `Ressource ${idx + 1}`}
                                         {r.type ? <span className="ml-2 text-xs text-gray-500">({r.type})</span> : null}
                                       </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <button onClick={() => setCurrentResourceIndex(idx)} className={`px-2 py-1 rounded border text-xs ${isActive ? 'border-emerald-300 text-emerald-700' : 'hover:bg-gray-50'}`}>Voir</button>
                                       {!!r.url && <a href={buildHref(r.url)} download className="px-2 py-1 rounded border text-xs text-gray-700 hover:bg-gray-50">Télécharger</a>}
                                     </div>
                                   </li>
                                 );
                               })}
                             </ul>
                           </div>

                           <div className="flex items-center justify-between">
                             <div className="text-sm text-gray-800">
                               {currentResource?.titre}
                               {currentResource?.type && <span className="ml-2 text-xs text-gray-500">({currentResource.type})</span>}
                             </div>
                             {!!currentResource?.url && (
                               <div className="flex items-center gap-3">
                                 <a href={buildHref(currentResource.url)} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700">Ouvrir</a>
                                 <a href={buildHref(currentResource.url)} download className="text-sm text-gray-600 hover:text-gray-800">Télécharger</a>
                               </div>
                             )}
                           </div>

                           {(() => {
                             const href = buildHref(currentResource?.url);
                             if (!href) return null;
                            if (currentResource?.type === 'video') return (
                              <video
                                src={href}
                                controls
                                className="w-full rounded-lg border"
                                onTimeUpdate={(e) => {
                                  try {
                                    const el = e.currentTarget;
                                    if (el && el.currentTime && el.duration && el.currentTime > Math.min(10, el.duration * 0.1)) {
                                      if (currentChapterId) markResourceViewed(currentChapterId, currentResource);
                                    }
                                  } catch {}
                                }}
                                onEnded={() => { if (currentChapterId) markResourceViewed(currentChapterId, currentResource); }}
                              />
                            );
                            if (currentResource?.type === 'pdf') return (
                              <iframe
                                src={href}
                                className="w-full h-96 rounded-lg border"
                                onLoad={() => { if (currentChapterId) markResourceViewed(currentChapterId, currentResource); }}
                              />
                            );
                            if (currentResource?.type === 'image') return (
                              <img
                                src={href}
                                alt={currentResource?.titre || 'Image'}
                                className="w-full rounded-lg border"
                                onLoad={() => { if (currentChapterId) markResourceViewed(currentChapterId, currentResource); }}
                              />
                            );
                             return (
                               <div className="text-sm text-gray-600">
                                 Type non pris en charge en aperçu. Utilisez le lien « Ouvrir ».
                               </div>
                             );
                           })()}
                         </>
                       )}

                       <div className="flex items-center justify-between pt-2 border-t">
                         <div className="text-xs text-gray-500">Ressource {resources.length ? (currentResourceIndex + 1) : 0} / {resources.length}</div>
                         <div className="space-x-2">
                           <button onClick={goPrev} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">Précédent</button>
                           <button onClick={goNext} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">Suivant</button>
                           <button onClick={() => { if (currentChapterId && currentResource) markResourceViewed(currentChapterId, currentResource); }} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">Marquer la ressource vue</button>
                           <button onClick={markAsDoneAndAdvance} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700">Marquer chapitre terminé</button>
                         </div>
                       </div>
                     </div>
                   )}
                </div>

               
              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


