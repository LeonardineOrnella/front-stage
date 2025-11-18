"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getQcms,
  createQcm,
  deleteQcm,
  getQuestionsByQcm,
  addQuestionToQcm,
  createQcmDeep,
} from "@/service/quiz.service";
import { QuestionService } from "@/service/question.service";
import { createReponse, getReponsesByQuestion } from "@/service/reponse.service";
import { formationService } from "@/service/formation.service";
import axios from "@/lib/axios";
import { Pencil, Trash2, Save, X, Plus, RefreshCcw, ChevronDown, ChevronRight, Search } from "lucide-react";
 

const inputBase = "border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
const btnBase = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1";
const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
const btnSecondary = `${btnBase} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300`;
const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
const btnSuccess = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500`;

export default function QuizPage() {
  const [qcms, setQcms] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [newQcmTitle, setNewQcmTitle] = useState("");
  const [selectedQcm, setSelectedQcm] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [newAnswer, setNewAnswer] = useState({ texte: "", est_correcte: false });
  const [newQuestionText, setNewQuestionText] = useState("");
  const [creatingQcm, setCreatingQcm] = useState(false);
  // Inline add state (existing QCM)
  const [newQuestionByQcm, setNewQuestionByQcm] = useState({}); // { [id_qcm]: string }
  const [newAnswerByQuestion, setNewAnswerByQuestion] = useState({}); // { [id_quest]: { texte, est_correcte } }
  const [newQuestionAnswersByQcm, setNewQuestionAnswersByQcm] = useState({}); // { [id_qcm]: Array<{ texte, est_correcte }> }
  // Inline edit state
  const [editingQuestion, setEditingQuestion] = useState(null); // id_quest | null
  const [editingQuestionText, setEditingQuestionText] = useState("");
  // Removed per-answer individual edit state (now handled in question edit)
  const [editingQuestionAnswersById, setEditingQuestionAnswersById] = useState({}); // { [id_rep]: { texte, est_correcte } }
  // Bulk edit per QCM
  const [editingAllQcmId, setEditingAllQcmId] = useState(null); // id_qcm | null
  const [editedQuestionsById, setEditedQuestionsById] = useState({}); // { [id_quest]: { quest, point } }
  const [editedAnswersById, setEditedAnswersById] = useState({}); // { [id_rep]: { texte, est_correcte } }
  // Confirm modal state
  const [confirmState, setConfirmState] = useState({ open: false, title: "", message: "", onConfirm: null });

  // Tabs: "list" | "create"
  const [activeTab, setActiveTab] = useState("list");
  const [qcmQuery, setQcmQuery] = useState("");
  const filteredQcms = useMemo(() => {
    const q = qcmQuery.trim().toLowerCase();
    if (!q) return qcms;
    return qcms.filter((item) => {
      const title = String(item?.titre_qcm || "").toLowerCase();
      const formation = String(item?.formation?.titre_form || "").toLowerCase();
      return title.includes(q) || formation.includes(q);
    });
  }, [qcms, qcmQuery]);
  const formationQuestionCounts = useMemo(() => {
    const counts = {};
    (qcms || []).forEach((item) => {
      const formationId = item?.formation?.id_form;
      const qCount = Array.isArray(item?.questions) ? item.questions.length : 0;
      if (!formationId) return;
      counts[formationId] = (counts[formationId] || 0) + qCount;
    });
    return counts;
  }, [qcms]);

  // Deep list expand state
  const [expandedQcmIds, setExpandedQcmIds] = useState(new Set());
  const toggleQcmExpand = (id) => {
    setExpandedQcmIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Deep creation state
  const [formations, setFormations] = useState([]);
  const [deepTitle, setDeepTitle] = useState("");
  const [deepFormationId, setDeepFormationId] = useState("");
  const [deepQuestions, setDeepQuestions] = useState([
    { quest: "", point: 1, reponses: [{ texte: "", est_correcte: 0 }] },
  ]);
  const [creatingDeep, setCreatingDeep] = useState(false);

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);

  // Charger tous les QCM (deep)
  const fetchQcms = async () => {
    const { data } = await axios.get('/qcm/deep');
    setQcms(data || []);
  };

  // Charger toutes les questions (pour ajout ultérieur)
  const [allQuestions, setAllQuestions] = useState([]);
  const fetchQuestions = async () => {
    const data = await QuestionService.getAll();
    setAllQuestions(data);
  };

  const fetchFormations = async () => {
    try {
      const data = await formationService.getAllFormations();
      setFormations(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQcms();
    fetchQuestions();
    fetchFormations();
  }, []);

  // Créer un QCM (rapide) - retiré de l'UI mais conservé si besoin futur
  const handleCreateQcm = async () => {
    const titre = newQcmTitle.trim();
    if (!titre) return alert('Saisissez un titre de QCM');
    try {
      setCreatingQcm(true);
      await createQcm({ titre_qcm: titre });
      setNewQcmTitle("");
      fetchQcms();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Erreur lors de la création du QCM';
      alert(msg);
    } finally {
      setCreatingQcm(false);
    }
  };

  // Deep: handlers
  const handleAddDeepQuestion = () => {
    setDeepQuestions((prev) => [...prev, { quest: "", point: 1, reponses: [{ texte: "", est_correcte: 0 }] }]);
  };
  const handleRemoveDeepQuestion = (idx) => {
    setDeepQuestions((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleDeepQuestionChange = (idx, key, value) => {
    setDeepQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [key]: value } : q)));
  };
  const handleAddDeepReponse = (qIdx) => {
    setDeepQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, reponses: [...q.reponses, { texte: "", est_correcte: 0 }] } : q)));
  };
  const handleRemoveDeepReponse = (qIdx, rIdx) => {
    setDeepQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, reponses: q.reponses.filter((_, j) => j !== rIdx) } : q)));
  };
  const handleDeepReponseChange = (qIdx, rIdx, key, value) => {
    setDeepQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx) return q;
      return {
        ...q,
        reponses: q.reponses.map((r, j) => (j === rIdx ? { ...r, [key]: value } : r)),
      };
    }));
  };
  const handleSubmitDeep = async () => {
    const titre = deepTitle.trim();
    if (!deepFormationId) return alert("Sélectionnez une formation");
    if (!titre) return alert("Saisissez le titre du QCM");
    for (const q of deepQuestions) {
      if (!q.quest.trim()) return alert("Chaque question doit avoir un libellé");
      if (!q.reponses || q.reponses.length === 0) return alert("Chaque question doit avoir au moins une réponse");
      for (const r of q.reponses) {
        if (!r.texte.trim()) return alert("Chaque réponse doit avoir un texte");
      }
    }
    try {
      setCreatingDeep(true);
      await createQcmDeep({
        titre_qcm: titre,
        id_form: Number(deepFormationId),
        questions: deepQuestions.map((q) => ({
          quest: q.quest.trim(),
          point: Number(q.point) || 1,
          reponses: q.reponses.map((r) => ({ texte: r.texte.trim(), est_correcte: r.est_correcte ? 1 : 0 })),
        })),
      });
      setDeepTitle("");
      setDeepFormationId("");
      setDeepQuestions([{ quest: "", point: 1, reponses: [{ texte: "", est_correcte: 0 }] }]);
      await fetchQcms();
      alert("QCM créé avec ses questions et réponses");
      setActiveTab("list");
      setShowPreview(false);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Erreur lors de la création avancée";
      alert(msg);
    } finally {
      setCreatingDeep(false);
    }
  };

  // Reset advanced creation form
  const handleResetDeep = () => {
    setDeepTitle("");
    setDeepFormationId("");
    setDeepQuestions([{ quest: "", point: 1, reponses: [{ texte: "", est_correcte: 0 }] }]);
    setShowPreview(false);
  };

  // Supprimer un QCM
  const deleteQcmById = async (id) => {
    await deleteQcm(id);
    fetchQcms();
  };
  const handleDeleteQcm = (id) => {
    setConfirmState({
      open: true,
      title: 'Confirmation',
      message: 'Supprimer ce QCM ? Cette action est irréversible.',
      onConfirm: () => deleteQcmById(id),
    });
  };

  // Add a new question inline to a given QCM
  const handleAddInlineQuestion = async (qcmId) => {
    const text = (newQuestionByQcm[qcmId] || "").trim();
    const answers = newQuestionAnswersByQcm[qcmId] || [];
    if (!text) return alert('Saisissez la question');
    try {
      const created = await QuestionService.create({ quest: text, point: 1 });
      // We need the id of the created question; backend should return it
      let createdId = created?.id_quest;
      if (!createdId) {
        // Fallback: reload all and find by text (not ideal but consistent with existing code)
        const allQ = await QuestionService.getAll();
        const match = allQ.find((q) => q.quest === text);
        if (!match?.id_quest) throw new Error("Question créée introuvable");
        createdId = match.id_quest;
      }
      await addQuestionToQcm(qcmId, createdId);

      // Create provided answers for the new question
      for (const a of answers) {
        const texte = (a.texte || "").trim();
        if (!texte) continue;
        await createReponse({ id_quest: createdId, texte, est_correcte: a.est_correcte ? 1 : 0 });
      }

      setNewQuestionByQcm((prev) => ({ ...prev, [qcmId]: "" }));
      setNewQuestionAnswersByQcm((prev) => ({ ...prev, [qcmId]: [] }));
      await fetchQcms();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Erreur lors de l'ajout de la question");
    }
  };

  const ensureNewQuestionAnswersInit = (qcmId) => {
    setNewQuestionAnswersByQcm((prev) => {
      if (Array.isArray(prev[qcmId])) return prev;
      return { ...prev, [qcmId]: [{ texte: "", est_correcte: 0 }, { texte: "", est_correcte: 0 }] };
    });
  };

  const handleAddNewQuestionAnswerField = (qcmId) => {
    setNewQuestionAnswersByQcm((prev) => ({
      ...prev,
      [qcmId]: [...(prev[qcmId] || []), { texte: "", est_correcte: 0 }],
    }));
  };

  const handleRemoveNewQuestionAnswerField = (qcmId, index) => {
    setNewQuestionAnswersByQcm((prev) => ({
      ...prev,
      [qcmId]: (prev[qcmId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleChangeNewQuestionAnswer = (qcmId, index, key, value) => {
    setNewQuestionAnswersByQcm((prev) => ({
      ...prev,
      [qcmId]: (prev[qcmId] || []).map((a, i) => (i === index ? { ...a, [key]: value } : a)),
    }));
  };

  // Delete a question from the system (will implicitly remove from QCM via backend referential integrity)
  const deleteQuestionById = async (questionId) => {
    await QuestionService.delete(questionId);
    await fetchQcms();
  };
  const handleDeleteQuestion = (questionId) => {
    setConfirmState({
      open: true,
      title: "Confirmation",
      message: "Supprimer cette question et toutes ses réponses ?",
      onConfirm: () => deleteQuestionById(questionId),
    });
  };

  // Add an answer inline to a given question
  const handleAddInlineAnswer = async (questionId) => {
    const entry = newAnswerByQuestion[questionId] || { texte: "", est_correcte: 0 };
    const texte = (entry.texte || "").trim();
    const est_correcte = entry.est_correcte ? 1 : 0;
    if (!texte) return alert("Saisissez la réponse");
    try {
      await createReponse({ id_quest: questionId, texte, est_correcte });
      setNewAnswerByQuestion((prev) => ({ ...prev, [questionId]: { texte: "", est_correcte: 0 } }));
      await fetchQcms();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Erreur lors de l'ajout de la réponse");
    }
  };

  const deleteAnswerById = async (answerId) => {
    const { deleteReponse } = await import("@/service/reponse.service");
    await deleteReponse(answerId);
    await fetchQcms();
  };
  const handleDeleteAnswer = (answerId) => {
    setConfirmState({
      open: true,
      title: "Confirmation",
      message: "Voulez-vous supprimer cette réponse ?",
      onConfirm: () => deleteAnswerById(answerId),
    });
  };

  // Edit question
  const beginEditQuestion = (quest) => {
    setEditingQuestion(quest.id_quest);
    setEditingQuestionText(quest.quest || "");
    const map = {};
    (quest.reponses || []).forEach((r) => {
      map[r.id_rep] = { texte: r.texte || "", est_correcte: r.est_correcte ? 1 : 0 };
    });
    setEditingQuestionAnswersById(map);
  };
  const cancelEditQuestion = () => {
    setEditingQuestion(null);
    setEditingQuestionText("");
    setEditingQuestionAnswersById({});
  };
  const saveEditQuestion = async (quest) => {
    const text = editingQuestionText.trim();
    if (!text) return alert('La question est requise');
    try {
      await QuestionService.update(quest.id_quest, { quest: text, point: quest.point ?? 1 });
      // Save answers changes for this question
      const { updateReponse } = await import("@/service/reponse.service");
      for (const r of (quest.reponses || [])) {
        const edited = editingQuestionAnswersById[r.id_rep];
        if (!edited) continue;
        const newText = (edited.texte || "").trim();
        const newCorrect = edited.est_correcte ? 1 : 0;
        const changed = newText !== (r.texte || "") || (newCorrect ? 1 : 0) !== (r.est_correcte ? 1 : 0);
        if (changed) {
          await updateReponse(r.id_rep, { texte: newText, est_correcte: newCorrect });
        }
      }
      cancelEditQuestion();
      await fetchQcms();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Erreur lors de la mise à jour de la question");
    }
  };

  // Edit answer
  const beginEditAnswer = (answer) => {
    setEditingAnswer(answer.id_rep);
    setEditingAnswerData({ texte: answer.texte || "", est_correcte: answer.est_correcte ? 1 : 0 });
  };
  const cancelEditAnswer = () => {
    setEditingAnswer(null);
    setEditingAnswerData({ texte: "", est_correcte: 0 });
  };
  const saveEditAnswer = async (answer) => {
    const { updateReponse } = await import("@/service/reponse.service");
    const texte = editingAnswerData.texte.trim();
    if (!texte) return alert('La réponse est requise');
    try {
      await updateReponse(answer.id_rep, { texte, est_correcte: editingAnswerData.est_correcte ? 1 : 0 });
      cancelEditAnswer();
      await fetchQcms();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Erreur lors de la mise à jour de la réponse");
    }
  };

  // Bulk edit helpers
  const beginEditAllForQcm = (qcm) => {
    setEditingAllQcmId(qcm.id_qcm);
    const qMap = {};
    const aMap = {};
    (qcm.questions || []).forEach((quest) => {
      qMap[quest.id_quest] = { quest: quest.quest || "", point: quest.point ?? 1 };
      (quest.reponses || []).forEach((r) => {
        aMap[r.id_rep] = { texte: r.texte || "", est_correcte: r.est_correcte ? 1 : 0 };
      });
    });
    setEditedQuestionsById(qMap);
    setEditedAnswersById(aMap);
  };

  const cancelEditAllForQcm = () => {
    setEditingAllQcmId(null);
    setEditedQuestionsById({});
    setEditedAnswersById({});
  };

  const saveEditAllForQcm = async (qcm) => {
    try {
      // Update questions
      for (const quest of qcm.questions || []) {
        const current = editedQuestionsById[quest.id_quest];
        if (!current) continue;
        const newText = (current.quest || "").trim();
        const newPoint = Number(current.point) || 1;
        const changed = newText !== (quest.quest || "") || newPoint !== (quest.point ?? 1);
        if (changed) {
          await QuestionService.update(quest.id_quest, { quest: newText, point: newPoint });
        }
      }
      // Update answers
      const { updateReponse } = await import("@/service/reponse.service");
      for (const quest of qcm.questions || []) {
        for (const r of quest.reponses || []) {
          const current = editedAnswersById[r.id_rep];
          if (!current) continue;
          const newText = (current.texte || "").trim();
          const newCorrect = current.est_correcte ? 1 : 0;
          const changed = newText !== (r.texte || "") || (newCorrect ? 1 : 0) !== (r.est_correcte ? 1 : 0);
          if (changed) {
            await updateReponse(r.id_rep, { texte: newText, est_correcte: newCorrect });
          }
        }
      }
      cancelEditAllForQcm();
      await fetchQcms();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Erreur lors de l'enregistrement des modifications");
    }
  };

  const handleDeleteAllAnswersForQuestion = async (quest) => {
    if (!quest?.reponses?.length) return;
    setConfirmState({
      open: true,
      title: 'Confirmation',
      message: 'Supprimer toutes les réponses de cette question ?',
      onConfirm: async () => {
    try {
      const { deleteReponse } = await import("@/service/reponse.service");
      for (const r of quest.reponses) {
        await deleteReponse(r.id_rep);
      }
      await fetchQcms();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Erreur lors de la suppression des réponses");
        } finally {
          setConfirmState((s)=>({ ...s, open:false }));
    }
      }
    });
  };

  // Helper: load responses for an array of questions (kept for old list usage)
  const loadResponsesFor = async (questionsList) => {
    const entries = await Promise.all(
      questionsList.map(async (q) => {
        try {
          const reps = await getReponsesByQuestion(q.id_quest);
          return [q.id_quest, reps];
        } catch {
          return [q.id_quest, []];
        }
      })
    );
    const map = Object.fromEntries(entries);
    setAnswersByQuestion(map);
  };

  // Sélectionner un QCM (kept for quick actions)
  const handleSelectQcm = async (qcm) => {
    setSelectedQcm(qcm);
    const data = await getQuestionsByQcm(qcm.id_qcm);
    setQuestions(data);
    setAnswersByQuestion({});
    if (data?.length) await loadResponsesFor(data);
  };

  // Ajouter une question directement au QCM sélectionné
  const handleCreateQuestion = async () => {
    if (!selectedQcm) return alert("Sélectionnez un QCM");
    if (!newQuestionText.trim()) return alert('Saisissez la question');
    const created = await QuestionService.create({ quest: newQuestionText.trim(), point: 1 });
    const allQ = await QuestionService.getAll();
    const createdQ = allQ.find(q => q.quest === newQuestionText.trim());
    if (createdQ?.id_quest) {
      await addQuestionToQcm(selectedQcm.id_qcm, createdQ.id_quest);
      const data = await getQuestionsByQcm(selectedQcm.id_qcm);
      setQuestions(data);
      setNewQuestionText("");
      await loadResponsesFor(data);
    }
  };

  // Ajouter une question au QCM
  const handleAddQuestion = async () => {
    if (!selectedQuestion) return alert('Sélectionnez une question');
    await addQuestionToQcm(selectedQcm.id_qcm, selectedQuestion);
    const data = await getQuestionsByQcm(selectedQcm.id_qcm);
    setQuestions(data);
    await loadResponsesFor(data);
  };

  const titleInvalid = activeTab === 'create' && showPreview && !deepTitle.trim();
  const formationInvalid = activeTab === 'create' && showPreview && !deepFormationId;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QCM</h1>
              <p className="mt-1 text-sm text-gray-600">Gérez vos questions et réponses</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">{qcms.length} QCM</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg border text-sm ${activeTab === "list" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("list")}
            >
              Liste
            </button>
            <button
              className={`px-4 py-2 rounded-lg border text-sm ${activeTab === "create" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("create")}
            >
              Créer
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {activeTab === "list" && (
            <>
              {/* Liste QCM (deep) */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                  <h2 className="font-semibold">Liste des QCM</h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <input
                        type="text"
                        value={qcmQuery}
                        onChange={(e) => setQcmQuery(e.target.value)}
                        placeholder="Rechercher un QCM ou une formation"
                        className={inputBase + " w-full pl-9"}
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      onClick={fetchQcms}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      title="Rafraîchir"
                      type="button"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {filteredQcms.length === 0 ? (
                  <div className="text-sm text-gray-500 flex items-center justify-between bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                    <span>Aucun QCM ne correspond à votre recherche.</span>
                    {qcms.length > 0 ? (
                      <button onClick={() => setQcmQuery("")} className="text-blue-600 hover:underline text-xs" type="button">Effacer le filtre</button>
                    ) : null}
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filteredQcms.map((qcm) => (
                      <li key={qcm.id_qcm} className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              className={`${btnSecondary} w-8 h-8 rounded-full p-0`}
                              onClick={() => toggleQcmExpand(qcm.id_qcm)}
                              title={expandedQcmIds.has(qcm.id_qcm) ? 'Réduire' : 'Développer'}
                            >
                              {expandedQcmIds.has(qcm.id_qcm) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <span>{qcm.titre_qcm}</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 border border-gray-200">
                                  {(qcm.questions?.length || 0)} questions
                                </span>
                              </div>
                              {qcm.formation && (
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  <span>Formation: {qcm.formation.titre_form}</span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                    {(formationQuestionCounts[qcm.formation.id_form] || 0)} questions
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingAllQcmId === qcm.id_qcm ? (
                              <>
                                <button
                                  onClick={() => saveEditAllForQcm(qcm)}
                                  className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                                  type="button"
                                  title="Enregistrer tout"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditAllForQcm}
                                  className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  type="button"
                                  title="Annuler"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => beginEditAllForQcm(qcm)}
                                  className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  type="button"
                                  title="Modifier tout"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQcm(qcm.id_qcm)}
                                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                                  type="button"
                                  title="Supprimer le QCM"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {expandedQcmIds.has(qcm.id_qcm) && (
                          <div className="mt-3 ml-11 transition-all duration-200 ease-out transform opacity-100 translate-y-0">
                            {(!qcm.questions || qcm.questions.length === 0) ? (
                              <div className="text-sm text-gray-500">Aucune question.</div>
                            ) : (
                              <ul className="space-y-2">
                                {qcm.questions.map((quest) => (
                                  <li key={quest.id_quest} className="border rounded p-3 hover:bg-gray-50">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        {editingAllQcmId === qcm.id_qcm ? (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={editedQuestionsById[quest.id_quest]?.quest || ""}
                                              onChange={(e) => setEditedQuestionsById((prev) => ({ ...prev, [quest.id_quest]: { ...(prev[quest.id_quest] || { point: quest.point ?? 1 }), quest: e.target.value } }))}
                                              className={inputBase + " flex-1"}
                                            />
                                            <input
                                              type="number"
                                              min={0}
                                              step="0.1"
                                              value={editedQuestionsById[quest.id_quest]?.point ?? (quest.point ?? 1)}
                                              onChange={(e) => setEditedQuestionsById((prev) => ({ ...prev, [quest.id_quest]: { ...(prev[quest.id_quest] || { quest: quest.quest || '' }), point: e.target.value } }))}
                                              className={inputBase + " w-24"}
                                            />
                                          </div>
                                        ) : editingQuestion === quest.id_quest ? (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={editingQuestionText}
                                              onChange={(e) => setEditingQuestionText(e.target.value)}
                                              className={inputBase + " flex-1"}
                                            />
                                            <button onClick={() => saveEditQuestion(quest)} className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700" type="button" title="Enregistrer">
                                              <Save className="w-4 h-4" />
                                            </button>
                                            <button onClick={cancelEditQuestion} className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300" type="button" title="Annuler">
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div>
                                            <div className="font-medium">{quest.quest}</div>
                                            <div className="text-xs text-gray-500">Points: {quest.point ?? 1}</div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {editingAllQcmId !== qcm.id_qcm && editingQuestion !== quest.id_quest && (
                                          <button
                                            onClick={() => beginEditQuestion(quest)}
                                            className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            type="button"
                                            title="Modifier la question"
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                        )}
                                        
                                        <button
                                          onClick={() => handleDeleteQuestion(quest.id_quest)}
                                          className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                                          type="button"
                                          title="Supprimer la question"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="mt-2 pl-3 border-l">
                                      {!quest.reponses || quest.reponses.length === 0 ? (
                                        <div className="text-sm text-gray-500">Aucune réponse.</div>
                                      ) : (
                                        <ul className="space-y-1">
                                          {quest.reponses.map((r) => (
                                            <li key={r.id_rep} className="text-sm flex items-center justify-between gap-2">
                                              {editingAllQcmId === qcm.id_qcm ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                  <input
                                                    type="text"
                                                    value={editedAnswersById[r.id_rep]?.texte || ""}
                                                    onChange={(e) => setEditedAnswersById((prev) => ({ ...prev, [r.id_rep]: { ...(prev[r.id_rep] || { est_correcte: r.est_correcte ? 1 : 0 }), texte: e.target.value } }))}
                                                    className={inputBase + " flex-1"}
                                                  />
                                                  <label className="flex items-center gap-2 text-xs select-none">
                                                    <input
                                                      type="checkbox"
                                                      className="accent-emerald-600 w-4 h-4 rounded"
                                                      checked={!!(editedAnswersById[r.id_rep]?.est_correcte)}
                                                      onChange={(e) => setEditedAnswersById((prev) => ({ ...prev, [r.id_rep]: { ...(prev[r.id_rep] || { texte: r.texte || '' }), est_correcte: e.target.checked ? 1 : 0 } }))}
                                                    />
                                                    <span>Correcte</span>
                                                  </label>
                                                </div>
                                              ) : editingQuestion === quest.id_quest ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                  <input
                                                    type="text"
                                                    value={editingQuestionAnswersById[r.id_rep]?.texte || ""}
                                                    onChange={(e) => setEditingQuestionAnswersById((prev) => ({ ...prev, [r.id_rep]: { ...(prev[r.id_rep] || { est_correcte: r.est_correcte ? 1 : 0 }), texte: e.target.value } }))}
                                                    className={inputBase + " flex-1"}
                                                  />
                                                  <label className="flex items-center gap-2 text-xs select-none">
                                                    <input
                                                      type="checkbox"
                                                      className="accent-emerald-600 w-4 h-4 rounded"
                                                      checked={!!(editingQuestionAnswersById[r.id_rep]?.est_correcte)}
                                                      onChange={(e) => setEditingQuestionAnswersById((prev) => ({ ...prev, [r.id_rep]: { ...(prev[r.id_rep] || { texte: r.texte || '' }), est_correcte: e.target.checked ? 1 : 0 } }))}
                                                    />
                                                    <span>Correcte</span>
                                                  </label>
                                                </div>
                                              ) : (
                                                <>
                                                  <div className="flex-1">
                                                    <span className={r.est_correcte ? "text-emerald-600 font-medium" : "text-gray-700"}>{r.texte}</span>
                                                    {r.est_correcte ? <span className="text-emerald-600 text-xs ml-1">(correcte)</span> : null}
                                                  </div>
                                                  <div className="flex items-center gap-2" />
                                                </>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      )}

                                      {/* Ajouter une réponse */}
                                      <div className="mt-3 flex items-center gap-2">
                                        <input
                                          type="text"
                                          placeholder="Nouvelle réponse"
                                          value={newAnswerByQuestion[quest.id_quest]?.texte || ""}
                                          onChange={(e) => setNewAnswerByQuestion((prev) => ({ ...prev, [quest.id_quest]: { ...(prev[quest.id_quest] || { est_correcte: 0 }), texte: e.target.value } }))}
                                          className={inputBase + " flex-1"}
                                        />
                                        <label className="flex items-center gap-2 text-sm select-none">
                                          <input
                                            type="checkbox"
                                            className="accent-emerald-600 w-4 h-4 rounded"
                                            checked={!!(newAnswerByQuestion[quest.id_quest]?.est_correcte)}
                                            onChange={(e) => setNewAnswerByQuestion((prev) => ({ ...prev, [quest.id_quest]: { ...(prev[quest.id_quest] || { texte: '' }), est_correcte: e.target.checked ? 1 : 0 } }))}
                                          />
                                          <span>Correcte</span>
                                        </label>
                                        <button
                                          onClick={() => handleAddInlineAnswer(quest.id_quest)}
                                          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                          type="button"
                                          title="Ajouter la réponse"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Ajouter une question à ce QCM */}
                            <div className="mt-4 border rounded p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Nouvelle question pour ce QCM"
                                  value={newQuestionByQcm[qcm.id_qcm] || ""}
                                  onChange={(e) => setNewQuestionByQcm((prev) => ({ ...prev, [qcm.id_qcm]: e.target.value }))}
                                  onFocus={() => ensureNewQuestionAnswersInit(qcm.id_qcm)}
                                  className={inputBase + " flex-1"}
                                />
                                <button
                                  onClick={() => handleAddInlineQuestion(qcm.id_qcm)}
                                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                  type="button"
                                  title="Ajouter la question"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              {/* Réponses pour la nouvelle question */}
                              <div className="mt-3 space-y-2">
                                {(newQuestionAnswersByQcm[qcm.id_qcm] || []).map((a, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder={`Réponse #${idx + 1}`}
                                      value={a.texte}
                                      onChange={(e) => handleChangeNewQuestionAnswer(qcm.id_qcm, idx, 'texte', e.target.value)}
                                      className={inputBase + " flex-1"}
                                    />
                                    <label className="flex items-center gap-2 text-sm select-none">
                                      <input
                                        type="checkbox"
                                        className="accent-emerald-600 w-4 h-4 rounded"
                                        checked={!!a.est_correcte}
                                        onChange={(e) => handleChangeNewQuestionAnswer(qcm.id_qcm, idx, 'est_correcte', e.target.checked ? 1 : 0)}
                                      />
                                      <span>Correcte</span>
                                    </label>
                                    <button
                                      onClick={() => handleRemoveNewQuestionAnswerField(qcm.id_qcm, idx)}
                                      className="text-red-600 hover:text-red-700 text-xs"
                                      type="button"
                                    >
                                      Retirer
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => handleAddNewQuestionAnswerField(qcm.id_qcm)}
                                  className="text-indigo-700 hover:text-indigo-800 text-sm"
                                  type="button"
                                >
                                  + Ajouter une réponse
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {activeTab === "create" && (
            <>
          {/* Création avancée QCM + Questions + Réponses */}
              <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Créer un QCM complet</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                <label className="block text-sm font-medium text-gray-700">Titre du QCM</label>
                    <input
                      type="text"
                  placeholder={'Ex. QCM Chapitre 1'}
                      value={deepTitle}
                      onChange={(e) => setDeepTitle(e.target.value)}
                      className={inputBase}
                    />
                <p className="text-xs text-gray-400 mt-1">Un titre court et explicite</p>
                  </div>
                  <div>
                <label className="block text-sm font-medium text-gray-700">Formation liée</label>
                    <select
                      value={deepFormationId}
                      onChange={(e) => setDeepFormationId(e.target.value)}
                      className={inputBase}
                    >
                  <option value="">Sélectionner une formation</option>
                      {formations.map((f) => (
                        <option key={f.id_form} value={f.id_form}>
                          {f.titre_form}
                        </option>
                      ))}
                    </select>
                <p className="text-xs text-gray-400 mt-1">Permet de rattacher le QCM à une formation</p>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddDeepQuestion}
                      className={`${btnPrimary} w-full`}
                      type="button"
                    >
                  + Ajouter une question
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {deepQuestions.map((q, qi) => (
                    <div key={qi} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                        placeholder={`Question #${qi + 1}`}
                            value={q.quest}
                            onChange={(e) => handleDeepQuestionChange(qi, "quest", e.target.value)}
                            className={inputBase + " flex-1"}
                          />
                          <input
                            type="number"
                                              min={0}
                                              step="0.1"
                            value={q.point}
                            onChange={(e) => handleDeepQuestionChange(qi, "point", e.target.value)}
                            className={inputBase + " w-28"}
                          />
                        </div>
                        <button
                          className="text-red-600 px-2 py-1 rounded hover:bg-red-50"
                          type="button"
                          onClick={() => handleRemoveDeepQuestion(qi)}
                        >
                      Retirer
                        </button>
                      </div>

                      <div className="pl-3 border-l space-y-2">
                        {q.reponses.map((r, ri) => (
                          <div key={ri} className="flex items-center gap-2">
                            <input
                              type="text"
                          placeholder={`Réponse #${ri + 1}`}
                              value={r.texte}
                              onChange={(e) => handleDeepReponseChange(qi, ri, "texte", e.target.value)}
                              className={inputBase + " flex-1"}
                            />
                            <label className="flex items-center gap-2 text-sm select-none">
                              <input
                                type="checkbox"
                                className="accent-emerald-600 w-4 h-4 rounded"
                                checked={!!r.est_correcte}
                                onChange={(e) => handleDeepReponseChange(qi, ri, "est_correcte", e.target.checked ? 1 : 0)}
                              />
                          <span>Correcte</span>
                            </label>
                            <button
                              className="text-red-600 px-2 py-1 rounded hover:bg-red-50"
                              type="button"
                              onClick={() => handleRemoveDeepReponse(qi, ri)}
                            >
                          Retirer
                            </button>
                          </div>
                        ))}
                        <button
                          className="text-indigo-700 hover:text-indigo-800"
                          type="button"
                          onClick={() => handleAddDeepReponse(qi)}
                        >
                      + Ajouter une réponse
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleResetDeep}
                    className={btnSecondary}
                    type="button"
                  >
                Réinitialiser
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className={btnSecondary}
                    type="button"
                  >
                Aperçu
                  </button>
                  <button
                    onClick={handleSubmitDeep}
                    className={btnSuccess}
                    disabled={creatingDeep}
                  >
                {creatingDeep ? 'Création…' : 'Créer le QCM'}
                  </button>
                </div>
              </div>

              {/* Preview Modal */}
              {showPreview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
                    <div className="space-y-2 mb-4">
                      <div>
                    <div className="text-sm text-gray-500">Titre</div>
                        <div className={`font-medium ${!deepTitle.trim() ? 'text-red-600' : ''}`}>{deepTitle || '—'}</div>
                      </div>
                      <div>
                    <div className="text-sm text-gray-500">Formation</div>
                        <div className={`font-medium ${!deepFormationId ? 'text-red-600' : ''}`}>
                          {formations.find(f => String(f.id_form) === String(deepFormationId))?.titre_form || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[55vh] overflow-auto pr-1">
                      {deepQuestions.map((q, i) => (
                        <div key={i} className="border rounded p-3">
                      <div className="font-medium">{q.quest || <span className="text-red-600">Question manquante</span>}</div>
                      <div className="text-xs text-gray-500">Points: {q.point ?? 1}</div>
                          <div className="mt-2 pl-3 border-l">
                        {!q.reponses?.length ? (
                          <div className="text-sm text-red-600">Aucune réponse</div>
                            ) : (
                              <ul className="space-y-1">
                                {q.reponses.map((r, ri) => (
                                  <li key={ri} className="text-sm flex items-center gap-2">
                                <span className={!r.texte?.trim() ? 'text-red-600' : ''}>{r.texte || 'Réponse manquante'}</span>
                                    {r.est_correcte ? <span className="text-emerald-600 text-xs">(correcte)</span> : null}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setShowPreview(false)} className={btnSecondary}>Modifier</button>
                      <button onClick={handleSubmitDeep} disabled={creatingDeep} className={btnSuccess}>
                    {creatingDeep ? 'Création…' : 'Confirmer et créer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Confirm Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setConfirmState((s) => ({ ...s, open: false }))}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{confirmState.title || 'Confirmation'}</h2>
            <p className="text-gray-600 mb-6">{confirmState.message || 'Êtes-vous sûr ?'}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmState((s) => ({ ...s, open: false }))}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                type="button"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const action = confirmState.onConfirm;
                  setConfirmState((s) => ({ ...s, open: false }));
                  try { if (typeof action === 'function') { await action(); } } catch (e) { /* already handled upstream */ }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                type="button"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
