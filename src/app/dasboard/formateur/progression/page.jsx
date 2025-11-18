"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { transactionService } from "@/service/transaction.service";
import { formationService } from "@/service/formation.service";
import { chapService } from "@/service/chap.service";
import { ressourceService } from "@/service/ressource.service";
import { progressionService } from "@/service/progression.service";
import { messageService } from "@/service/message.service";
import { toast } from "react-toastify";
import { 
  Search, 
  BarChart3, 
  Filter, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  Users,
  X
} from "lucide-react";
 

export default function ProgressionFormateurPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerProgress, setLearnerProgress] = useState(0);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChapterProgress, setLoadingChapterProgress] = useState(false);
  const [chaptersProgress, setChaptersProgress] = useState([]);
  const [globalProgress, setGlobalProgress] = useState({});
  const messagesEndRef = useRef(null);

  const load = async (id) => {
    try {
      setLoading(true);
      if (id) {
        // Charger les transactions d'une formation spécifique
        const res = await transactionService.getFormationTransactions(Number(id));
        const data = res?.data?.data || res?.data || [];
        console.log('📊 Transactions formation spécifique:', data);
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        // Charger toutes les transactions de tous les apprenants (pour formateur)
        const res = await transactionService.getAllTransactions();
        const data = res?.data?.data || res?.data || [];
        console.log('📊 Toutes les transactions:', data);
        console.log('📊 Nombre de transactions:', data.length);
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des transactions:', e);
      console.error('Détails de l\'erreur:', e.response?.data);
      toast.error('Erreur lors du chargement des transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les formations et les apprenants au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les formations
        const formationsData = await formationService.getAllFormations();
        setFormations(Array.isArray(formationsData) ? formationsData : []);
        
        // Charger tous les apprenants directement
        await load();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Le chargement a échoué');
      }
    };
    loadData();
  }, []);


  const learners = useMemo(() => {
    console.log('👥 Traitement des transactions pour créer la liste des apprenants...');
    console.log('📊 Transactions reçues:', transactions);
    console.log('📊 Nombre de transactions:', transactions.length);
    
    // Regrouper par utilisateur
    const map = new Map();
    for (const t of transactions) {
      const id = t.id; // id utilisateur
      console.log('🔍 Traitement transaction:', t);
      console.log('👤 ID utilisateur:', id);
      
      if (!id) {
        console.log('⚠️ Transaction sans ID utilisateur ignorée:', t);
        continue;
      }
      
      if (!map.has(id)) {
        map.set(id, {
          userId: id,
          nom: t.nom_user || t.nom,
          prenom: t.prenom_user || t.prenom,
          email: t.email_user || t.email,
          transactions: [],
        });
        console.log('➕ Nouvel apprenant ajouté:', map.get(id));
      }
      map.get(id).transactions.push(t);
    }
    
    const result = Array.from(map.values());
    console.log('👥 Apprenants finaux:', result);
    console.log('👥 Nombre d\'apprenants:', result.length);
    return result;
  }, [transactions]);

  const filteredLearners = useMemo(() => {
    let filtered = learners;
    
    // Filtre par formation
    if (selectedFormation) {
      filtered = filtered.filter(learner => 
        learner.transactions.some(t => t.id_form == selectedFormation)
      );
    }
    
    // Filtre par recherche
    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((l) => {
        const fields = [l.nom, l.prenom, l.email].map((x) => (x || "").toLowerCase());
        return fields.some((f) => f.includes(q));
      });
    }
    
    return filtered;
  }, [learners, search, selectedFormation]);

  // Détecter le paramètre learnerId dans l'URL et ouvrir automatiquement la discussion
  useEffect(() => {
    const learnerIdParam = searchParams?.get('learnerId');
    if (learnerIdParam && learners.length > 0) {
      // Trouver l'apprenant correspondant dans la liste
      const learner = learners.find(l => l.userId == learnerIdParam);
      if (learner) {
        // Ouvrir automatiquement la discussion avec cet apprenant
        viewLearnerMessages(learner);
        // Nettoyer l'URL en retirant le paramètre
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('learnerId');
          window.history.replaceState({}, '', url);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, learners]);

  // Calculer la progression globale pour les apprenants affichés
  useEffect(() => {
    const computeForVisibleLearners = async () => {
      const entriesToCompute = filteredLearners.filter(l => globalProgress[l.userId] == null);
      if (entriesToCompute.length === 0) return;
      for (const learner of entriesToCompute) {
        try {
          const percent = await computeLearnerGlobalProgress(learner);
          setGlobalProgress(prev => ({ ...prev, [learner.userId]: percent }));
        } catch {
          setGlobalProgress(prev => ({ ...prev, [learner.userId]: 0 }));
        }
      }
    };
    computeForVisibleLearners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLearners]);

  // Helper: calcule la progression globale d'un apprenant
  const computeLearnerGlobalProgress = async (learner) => {
    const learnerId = learner.userId;
    // 1) Tenter côté back-end (agrégé)
    try {
      const res = await progressionService.getGlobalByUser(learnerId);
      const data = res?.data?.data || res?.data;
      if (data && (data.percent != null)) {
        return Number(data.percent) || 0;
      }
    } catch {}

    // 2) Fallback: agréger côté front (moins fiable côté formateur) pondéré par durée
    const formationIds = Array.from(new Set(learner.transactions.map((t) => t.id_form)));
    let weightedSum = 0;
    let weightTotal = 0;

    const parseDurationToMinutes = (val) => {
      if (val == null) return 0;
      if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
      const s = String(val).trim().toLowerCase();
      if (!s) return 0;
      if (s.includes(':')) {
        const parts = s.split(':').map(p => parseInt(p, 10) || 0);
        let h = 0, m = 0, sec = 0;
        if (parts.length === 3) [h, m, sec] = parts;
        else if (parts.length === 2) [h, m] = parts; // HH:MM
        else if (parts.length === 1) m = parts[0];
        return Math.max(0, Math.round(h * 60 + m + sec / 60));
      }
      const hourMatch = s.match(/(\d+)\s*h/);
      const minuteMatch = s.match(/(\d+)\s*m(in)?/);
      if (hourMatch || minuteMatch) {
        const h = hourMatch ? parseInt(hourMatch[1], 10) || 0 : 0;
        const m = minuteMatch ? parseInt(minuteMatch[1], 10) || 0 : 0;
        return Math.max(0, h * 60 + m);
      }
      const num = parseInt(s, 10);
      return Math.max(0, Number.isFinite(num) ? num : 0);
    };

    for (const fid of formationIds) {
      let backendCompletedByChapter = null;
      try {
        const res = await progressionService.getByUserFormation(learnerId, fid);
        const row = res?.data?.data || res?.data;
        if (row && row.completed_by_chapter) {
          backendCompletedByChapter = typeof row.completed_by_chapter === 'string'
            ? JSON.parse(row.completed_by_chapter)
            : row.completed_by_chapter;
        }
      } catch {}

      const chapters = await chapService.getByFormation(fid);
      for (const chap of chapters) {
        const chapId = chap.id_chap || chap.id || chap.chapitre_id || chap.ID;
        const weight = (() => {
          const minutes = parseDurationToMinutes(chap.duree_chap != null ? chap.duree_chap : chap.duree);
          return minutes > 0 ? minutes : 1;
        })();
        let resources = [];
        try {
          resources = await ressourceService.listByChapitre(chapId);
        } catch {}

        let percent = 0;
        try {
          if (backendCompletedByChapter && backendCompletedByChapter[chapId] != null) {
            percent = Number(backendCompletedByChapter[chapId]) || 0;
          } else if (resources && resources.length > 0) {
            const key = `resource_progress_${learnerId}_${chapId}`;
            const stored = localStorage.getItem(key);
            if (stored) {
              const progressData = JSON.parse(stored);
              const viewedCount = Object.values(progressData).filter((r) => r && r.viewed).length;
              percent = Math.round((viewedCount / resources.length) * 100);
            }
          } else {
            const ckey = `chapter_progress_${learnerId}_${chapId}`;
            const storedChap = localStorage.getItem(ckey);
            if (storedChap) {
              const data = JSON.parse(storedChap);
              percent = data.completed ? 100 : 0;
            }
          }
        } catch {}

        weightedSum += percent * weight;
        weightTotal += weight;
      }
    }

    return weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
  };

  // Fonction pour voir la progression d'un apprenant
  const viewLearnerProgress = async (learner) => {
    setSelectedLearner(learner);
    setShowProgressModal(true);
    setLoadingChapterProgress(true);

    try {
      const learnerId = learner.userId;
      // Formations uniques de l'apprenant
      const formationIds = Array.from(new Set(learner.transactions.map((t) => t.id_form)));
      const idToTitle = new Map(formations.map((f) => [f.id_form, f.titre_form]));

      const formationsWithChapters = [];
      let totalPercentSum = 0;
      let totalChapterCount = 0;

      for (const fid of formationIds) {
        // 1) Essayer de récupérer la progression back-end (si disponible)
        let backendCompletedByChapter = null;
        try {
          const res = await progressionService.getByUserFormation(learnerId, fid);
          const row = res?.data?.data || res?.data;
          if (row && row.completed_by_chapter) {
            backendCompletedByChapter = typeof row.completed_by_chapter === 'string'
              ? JSON.parse(row.completed_by_chapter)
              : row.completed_by_chapter;
          }
        } catch {}

        const chapters = await chapService.getByFormation(fid);
        const chaptersWithPercent = [];

        for (const chap of chapters) {
          const chapId = chap.id_chap || chap.id || chap.chapitre_id || chap.ID;
          let resources = [];
          try {
            resources = await ressourceService.listByChapitre(chapId);
          } catch {}

          let percent = 0;
          try {
            // priorité à la progression backend si renseignée
            if (backendCompletedByChapter && backendCompletedByChapter[chapId] != null) {
              percent = Number(backendCompletedByChapter[chapId]) || 0;
            } else if (resources && resources.length > 0) {
              const key = `resource_progress_${learnerId}_${chapId}`;
              const stored = localStorage.getItem(key);
              if (stored) {
                const progressData = JSON.parse(stored);
                const viewedCount = Object.values(progressData).filter((r) => r && r.viewed).length;
                percent = Math.round((viewedCount / resources.length) * 100);
              }
            } else {
              const ckey = `chapter_progress_${learnerId}_${chapId}`;
              const storedChap = localStorage.getItem(ckey);
              if (storedChap) {
                const data = JSON.parse(storedChap);
                percent = data.completed ? 100 : 0;
              }
            }
          } catch {}

          chaptersWithPercent.push({
            id: chapId,
            title: chap.titre_chap || chap.titre || chap.nom || `Chapitre ${chapId}`,
            percent,
          });

          totalPercentSum += percent;
          totalChapterCount += 1;
        }

        formationsWithChapters.push({
          formationId: fid,
          formationTitle: idToTitle.get(fid) || `Formation #${fid}`,
          chapters: chaptersWithPercent,
        });
      }

      setChaptersProgress(formationsWithChapters);
      setLearnerProgress(totalChapterCount > 0 ? Math.round(totalPercentSum / totalChapterCount) : 0);
    } catch (e) {
      console.error('Erreur chargement progression par chapitre:', e);
      setChaptersProgress([]);
    } finally {
      setLoadingChapterProgress(false);
    }
  };

  // Fonction pour voir les messages d'un apprenant
  const viewLearnerMessages = async (learner) => {
    setSelectedLearner(learner);
    setShowMessagesModal(true);
    await loadMessages(learner.userId);
  };

  // Fonction pour charger les messages d'un apprenant
  const loadMessages = async (learnerId) => {
    try {
      setLoadingMessages(true);
      
      // Récupérer l'ID du formateur connecté
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const formateurId = currentUser.id;
      
      // Charger les vrais messages depuis l'API
      try {
        // Utilise la route dédiée formateur ↔ apprenant
        const response = await messageService.getConversationWithLearner(learnerId);
        const apiMessages = response.data?.data || response.data || [];
        
        if (apiMessages.length > 0) {
          // Transformer les messages de l'API au format attendu
          const formattedMessages = apiMessages.map(msg => {
            const senderId = Number(msg.sender_id) || msg.sender_id;
            const receiverId = Number(msg.receiver_id) || msg.receiver_id;
            // Déterminer si le message vient du formateur ou de l'apprenant
            const isFromFormateur = Number(senderId) === Number(formateurId);
            
            return {
            id: msg.id,
              senderId: senderId,
              receiverId: receiverId,
            message: msg.content || msg.message,
            timestamp: msg.created_at || msg.timestamp,
              senderType: isFromFormateur ? 'formateur' : 'apprenant',
              isRead: msg.is_read === 1 || msg.is_read === true
            };
          });
          
          // Trier par timestamp pour afficher dans l'ordre chronologique
          formattedMessages.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          
          setMessages(formattedMessages);
          return;
        }
      } catch (apiError) {
        console.error('Erreur API messages:', apiError);
        // Ne pas utiliser les messages simulés, juste afficher un message vide
        setMessages([]);
        return;
      }
      
      // Si aucun message, initialiser avec un tableau vide
      setMessages([]);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Impossible de charger les messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fonction pour envoyer une réponse
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedLearner) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
      setSendingMessage(true);
      
      try {
      // Envoyer le message via l'API
        const messageData = {
          receiver_id: selectedLearner.userId,
        content: messageContent,
          message_type: 'text'
        };
        
        const response = await messageService.sendMessage(messageData);
        const sentMessage = response.data?.data || response.data;
        
      // Recharger les messages pour avoir la version complète depuis l'API
      await loadMessages(selectedLearner.userId);
      
      // Scroll vers le bas après l'envoi
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      toast.success('Message envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Impossible d\'envoyer le message');
      setNewMessage(messageContent); // Restaurer le message en cas d'erreur
    } finally {
      setSendingMessage(false);
    }
  };

  // Scroll automatique quand les messages changent
  useEffect(() => {
    if (messages.length > 0 && !loadingMessages) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, loadingMessages]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-2">
      <div className="max-w-6xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> Suivi de progression
            </h1>
            <p className="text-sm text-gray-600">Consultez l’activité et la progression de vos apprenants</p>
          </div>
        </div>

        {/* Filtres et recherche améliorés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filtres</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtre par formation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par formation</label>
              <select
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Toutes les formations</option>
                {formations.map((formation) => (
                  <option key={formation.id_form} value={formation.id_form}>
                    {formation.titre_form}
                  </option>
                ))}
              </select>
            </div>

            {/* Recherche apprenant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher un apprenant</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, prénom ou email"
                  className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => load(selectedFormation || undefined)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {loading ? 'Chargement…' : selectedFormation ? 'Charger la formation' : 'Charger tout'}
              </button>
              <button
                onClick={() => load()}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  loading 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Rafraîchir
              </button>
            </div>
          </div>

          {/* Filtres actifs */}
          {(selectedFormation || search) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Filtres actifs</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFormation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                    Formation: {formations.find(f => f.id_form == selectedFormation)?.titre_form || selectedFormation}
                    <button
                      onClick={() => setSelectedFormation("")}
                      className="ml-1 hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Recherche: "{search}"
                    <button
                      onClick={() => setSearch("")}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedFormation("");
                    setSearch("");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b text-sm text-gray-700 flex items-center justify-between">
              <div>
                {loading ? (
                  <span>Chargement des apprenants...</span>
                ) : selectedFormation ? (
                  <span>
                    {formations.find(f => f.id_form == selectedFormation)?.titre_form || `Formation #${selectedFormation}`} — {filteredLearners.length} apprenants
                  </span>
                ) : (
                  <span>
                    Tous les apprenants — {filteredLearners.length} apprenants trouvés
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {transactions.length} transactions
              </div>
            </div>

          {loading ? (
            <div className="p-6 text-gray-600">Chargement…</div>
          ) : filteredLearners.length === 0 ? (
            <div className="p-6 text-gray-600">
              {selectedFormation ? 'Aucun apprenant pour cette formation' : 'Aucun apprenant trouvé'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="text-left px-4 py-3 font-medium">Apprenant</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Formations</th>
                    <th className="text-left px-4 py-3 font-medium">Progression globale</th>
                    <th className="text-center px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLearners.map((l) => {
                    const formationsCount = new Set(l.transactions.map(t => t.id_form)).size;
                    const percent = globalProgress[l.userId];
                    
                    return (
                      <tr key={`learner-${l.userId}`} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-emerald-700">
                                {l.prenom?.[0]?.toUpperCase() || l.nom?.[0]?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{l.prenom} {l.nom}</div>
                              <div className="text-xs text-gray-500">ID: {l.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{l.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{formationsCount}</span>
                            <span className="text-gray-500">formation{formationsCount > 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {percent == null ? (
                            <span className="text-gray-500">Calcul…</span>
                          ) : (
                            <div className="w-48">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>{percent}%</span>
                          </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => viewLearnerProgress(l)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Voir la progression"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => viewLearnerMessages(l)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir les messages"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de progression */}
        {showProgressModal && selectedLearner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {`Progression de ${selectedLearner.prenom} ${selectedLearner.nom}`}
                  </h3>
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">
                      {learnerProgress}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${learnerProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Inscriptions</div>
                      <div className="font-semibold">{selectedLearner.transactions.length}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Dernière activité</div>
                      <div className="font-semibold">
                        {selectedLearner.transactions.length > 0 
                          ? new Date([...selectedLearner.transactions].sort((a, b) => new Date(b.date_trans) - new Date(a.date_trans))[0].date_trans).toLocaleDateString()
                          : "—"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-800 mb-2">Progression par chapitre</div>
                    {loadingChapterProgress ? (
                      <div className="text-sm text-gray-500">Chargement…</div>
                    ) : chaptersProgress.length === 0 ? (
                      <div className="text-sm text-gray-500">Aucune donnée de progression</div>
                    ) : (
                      <div className="space-y-4">
                        {chaptersProgress.map((f) => (
                          <div key={`f-${f.formationId}`} className="">
                            <div className="text-sm font-medium text-gray-700 mb-1">{f.formationTitle}</div>
                            <div className="space-y-2">
                              {f.chapters.map((c) => (
                                <div key={`c-${c.id}`} className="">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span className="truncate pr-2">{c.title}</span>
                                    <span className="font-medium text-gray-800">{c.percent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${c.percent}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                  Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de messages */}
        {showMessagesModal && selectedLearner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 h-[80vh] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-emerald-700">
                        {selectedLearner.prenom?.[0]?.toUpperCase() || selectedLearner.nom?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {`Conversation avec ${selectedLearner.prenom} ${selectedLearner.nom}`}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedLearner.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowMessagesModal(false);
                      setMessages([]);
                      setNewMessage("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Zone des messages */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucun message</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      // Déterminer si c'est un message reçu ou envoyé
                      const isReceived = msg.senderType === 'apprenant';
                      const isSent = msg.senderType === 'formateur';
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isSent
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="text-sm">{msg.message}</div>
                            <div className={`text-xs mt-1 ${
                              isSent ? 'text-emerald-100' : 'text-gray-500'
                            }`}>
                              {new Date(msg.timestamp).toLocaleString()}
                              {isSent && (
                                <span className="ml-2">✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Zone de saisie */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      !newMessage.trim() || sendingMessage
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {sendingMessage ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Envoi…
                      </div>
                    ) : (
                      'Envoyer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


