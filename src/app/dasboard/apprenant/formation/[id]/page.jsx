'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formationService } from '@/service/formation.service';
import api from '@/lib/axios';
import { transactionService } from '@/service/transaction.service';
import { userService } from '@/service/user.service';
import PaymentModal from '@/components/frontOffice/PaymentModal';
import { toast } from 'react-toastify';

export default function FormationSuiviPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = useMemo(() => params?.id, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chapterResources, setChapterResources] = useState({}); // id_chap -> resources[]
  const coverUrl = useMemo(() => {
    const raw = formation?.image_couverture;
    if (!raw) return null;
    if (typeof raw === 'string') {
      if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
      if (raw.startsWith('/')) return `http://localhost:3001${raw}`;
      // default to couvertures folder
      return `http://localhost:3001/uploads/couvertures/${raw}`;
    }
    return null;
  }, [formation]);

  // Récupérer les informations de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };
    fetchUser();
  }, []);

  // Récupérer les informations de la formation (normalisation des réponses)
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
        const raw = await formationService.getFormationById(numericId);
        const pick = (val) => Array.isArray(val) ? (val[0] || null) : val;
        const src = pick(raw?.formation || raw?.data || raw);
        let normalized = src ? {
          id_form: src.id_form ?? src.id ?? src.formation_id ?? src.ID,
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
        // Si pas de chapitres intégrés, charger via endpoint chapitres/formation
        if (normalized && (!Array.isArray(normalized.chapitres) || normalized.chapitres.length === 0) && normalized.id_form) {
          try {
            const chapRes = await api.get(`/chapitres/formation/${normalized.id_form}`);
            const chapList = Array.isArray(chapRes?.data) ? chapRes.data : (Array.isArray(chapRes?.data?.data) ? chapRes.data.data : []);
            normalized.chapitres = chapList;
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
        // Fallback 1: récupérer toutes les formations et rechercher par id
        try {
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
            // Fallback 2: si des chapitres existent pour cet id, construire une formation minimale
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
            } catch (e2) {
              setError(e?.message || 'Erreur de chargement de la formation');
              setFormation(null);
            }
          }
        } catch (e1) {
          setError(e?.message || 'Erreur de chargement de la formation');
          setFormation(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId]);

  // Vérifier l'accès à la formation + polling auto si en attente
  useEffect(() => {
    if (!formationId || !user) return;
    
    const checkAccess = async () => {
      setCheckingAccess(true);
      try {
        // Si la formation est gratuite, l'accès est automatique
        if (!formation?.frais_form || formation.frais_form === 0) {
          setHasAccess(true);
          return;
        }
        
        // Vérifier si l'utilisateur a payé
        const hasPayment = await transactionService.checkFormationAccess(formationId, user.id);
        setHasAccess(hasPayment);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'accès:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    if (formation) {
      checkAccess();
    }
  }, [formationId, user, formation]);

  useEffect(() => {
    if (!formationId || !user || !formation) return;
    // Si payante et pas d'accès, activer un polling léger
    if (formation?.frais_form && !hasAccess) {
      const intervalId = setInterval(async () => {
        try {
          const paid = await transactionService.checkFormationAccess(formationId, user.id);
          if (paid) {
            setHasAccess(true);
            clearInterval(intervalId);
          }
        } catch {}
      }, 10000); // 10s
      return () => clearInterval(intervalId);
    }
  }, [formationId, user, formation, hasAccess]);
 // Charger les ressources de chaque chapitre (même sans accès, pour afficher la liste)
useEffect(() => {
  if (!Array.isArray(formation?.chapitres) || formation.chapitres.length === 0) return;
  let cancelled = false;
  (async () => {
    const result = {};
    for (const chap of formation.chapitres) {
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
      } catch {
        result[chapId] = [];
      }
    }
    if (!cancelled) setChapterResources(result);
  })();
  return () => { cancelled = true; };
}, [formation]);

  const handlePaymentSuccess = (transactionData) => {
    toast.success('Inscription réussie! Votre paiement est en cours de validation.');
    // Recharger l'accès après paiement
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleStartFormation = () => {
    if (hasAccess) {
      // Rediriger vers le contenu de la formation
      router.push(`/dasboard/apprenant/formation/${formationId}/contenu`);
    } else {
      setShowPaymentModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative">
          <div className={`h-40 sm:h-56 w-full ${coverUrl ? '' : 'bg-gradient-to-r from-emerald-50 to-blue-50'} overflow-hidden`}>
            {coverUrl ? (
              <div className="h-full w-full relative">
                <img src={coverUrl} alt={formation?.titre_form || 'Couverture'} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
              </div>
            ) : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 px-6 py-4 flex items-end justify-between">
          <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${coverUrl ? 'text-white drop-shadow' : 'text-gray-900'}`}>{formation?.titre_form || 'Formation'}</h1>
              <p className={`${coverUrl ? 'text-white/90' : 'text-gray-600'} text-sm`}>Suivez le contenu chapitre par chapitre.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${coverUrl ? 'bg-white/20 text-white border border-white/30' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>Durée: {formation?.duree_form || '—'}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${coverUrl ? 'bg-white/20 text-white border border-white/30' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>Prix: {formation?.frais_form ? `${formation.frais_form} €` : 'Gratuit'}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${coverUrl ? 'bg-white/20 text-white border border-white/30' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{formation?.chapitres?.length || 0} chapitre{(formation?.chapitres?.length || 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
            {/* Bouton retour supprimé selon demande */}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-600">Chargement…</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : !formation ? (
            <div className="text-center text-gray-600">Formation introuvable.</div>
          ) : (
            <div className="space-y-6">
              {/* Présentation supprimée selon demande */}

              {/* Access Status */}
              {checkingAccess ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Vérification de votre accès...</p>
                </div>
              ) : (
                <div className={`rounded-lg p-6 ${hasAccess ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start space-x-3">
                    {hasAccess ? (
                      <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <h3 className={`font-medium ${hasAccess ? 'text-green-800' : 'text-yellow-800'}`}>
                        {hasAccess ? 'Accès autorisé' : 'Inscription requise'}
                      </h3>
                      <p className={`text-sm mt-1 ${hasAccess ? 'text-green-700' : 'text-yellow-700'}`}>
                        {hasAccess 
                          ? 'Vous avez accès à cette formation. Vous pouvez commencer le contenu.'
                          : formation.frais_form 
                            ? 'Cette formation est payante. Vous devez vous inscrire pour y accéder.'
                            : 'Cette formation est gratuite. Cliquez sur "Commencer" pour y accéder.'
                        }
                      </p>
                    </div>
                    {!hasAccess && formation?.frais_form ? (
                      <button
                        type="button"
                        onClick={async () => {
                          setCheckingAccess(true);
                          try {
                            const paid = await transactionService.checkFormationAccess(formationId, user.id);
                            setHasAccess(paid);
                          } finally {
                            setCheckingAccess(false);
                          }
                        }}
                        className="ml-4 px-3 py-2 text-sm rounded-lg border border-yellow-300 text-yellow-800 bg-white hover:bg-yellow-50"
                      >
                        Rafraîchir l'accès
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Chapitres */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Programme de la formation</h2>
                {formation.chapitres?.length ? (
                  <div className="space-y-3">
                    {formation.chapitres.map((chapitre, index) => (
                      <div key={chapitre.id_chap || chapitre.id || chapitre.chapitre_id || index} className={`border rounded-lg p-4 ${hasAccess ? 'bg-white' : 'bg-gray-50'}`}>
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${hasAccess ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-medium ${hasAccess ? 'text-gray-900' : 'text-gray-600'}`}>
                              {chapitre.titre_chap || chapitre.titre || 'Chapitre'}
                            </h3>
                            {chapitre.duree && (
                              <p className="text-sm text-gray-500 mt-1">
                                Durée: {chapitre.duree}
                              </p>
                            )}
                            <div className="mt-3">
                              <div className="text-sm font-medium text-gray-700 mb-1">Ressources</div>
                              <ul className="space-y-2">
                                  {(() => {
                                    const cid = chapitre.id_chap || chapitre.id || chapitre.chapitre_id || chapitre.ID;
                                    const resList = chapterResources[cid] || chapitre.ressources || [];
                                    if (!Array.isArray(resList) || resList.length === 0) {
                                      return <li className="text-sm text-gray-500">Aucune ressource</li>;
                                    }
                                  return resList.map((r, idx) => {
                                    let href = r.url || '';
                                    if (typeof href === 'string') {
                                      if (href.startsWith('http://') || href.startsWith('https://')) {
                                        // absolute
                                      } else if (href.startsWith('/')) {
                                        href = `http://localhost:3001${href}`;
                                      } else {
                                        href = `http://localhost:3001/${href}`;
                                      }
                                    }
                                      return (
                                        <li key={r.id_res || r.id || idx} className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-800">
                                              {r.titre}
                                              {r.type && <span className="ml-2 text-xs text-gray-500">({r.type})</span>}
                                            </div>
                                            {href ? (
                                              hasAccess ? (
                                                <a href={href} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700">Ouvrir</a>
                                              ) : (
                                                <span className="text-sm text-gray-400">Verrouillé</span>
                                              )
                                            ) : null}
                                          </div>
                                        {hasAccess && href && r.type === 'video' && (
                                            <video src={href} controls className="w-full rounded-lg border" />
                                          )}
                                        {hasAccess && href && r.type === 'pdf' && (
                                            <iframe src={href} className="w-full h-80 rounded-lg border" />
                                          )}
                                        {hasAccess && href && r.type === 'image' && (
                                          <img src={href} alt={r.titre || 'Image'} className="w-full rounded-lg border" />
                                        )}
                                        </li>
                                      );
                                    });
                                  })()}
                              </ul>
                              {!hasAccess && (
                                <p className="text-xs text-gray-500 mt-2">Inscrivez-vous pour ouvrir et lire les ressources.</p>
                              )}
                            </div>
                          </div>
                          {!hasAccess && (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Aucun chapitre disponible pour le moment.</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {hasAccess ? 'Vous pouvez commencer cette formation' : 'Inscription requise pour accéder au contenu'}
                </div>
                <button
                  onClick={handleStartFormation}
                  disabled={checkingAccess}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    hasAccess
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {checkingAccess ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Vérification...
                    </div>
                  ) : hasAccess ? (
                    'Commencer la formation'
                  ) : (
                    `S'inscrire${formation.frais_form ? ` - ${formation.frais_form} €` : ''}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && formation && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          formation={formation}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}


