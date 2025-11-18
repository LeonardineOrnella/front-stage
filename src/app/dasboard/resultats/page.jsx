'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResultatService } from '@/service/resultat.service';
import axios from '@/lib/axios';
import { getQuestionsByQcm } from '@/service/quiz.service';
import { getReponsesByQuestion } from '@/service/reponse.service';

export default function ApprenantResultatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qcmId = useMemo(() => Number(searchParams?.get('qcm')), [searchParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qcmTitle, setQcmTitle] = useState('');
  const [result, setResult] = useState(null); // { note, total_questions, ... }
  const [questions, setQuestions] = useState([]); // with answers for correction

  useEffect(() => {
    if (!qcmId || !Number.isFinite(qcmId) || qcmId <= 0) {
      router.replace('/dasboard/apprenant/progression');
      return;
    }
    (async () => {
      setLoading(true);
      setError('');
      try {
        // 1) Charger la dernière tentative côté backend
        const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!userData) throw new Error("Session requise");
        const user = JSON.parse(userData);
        if (!user?.id) throw new Error("Utilisateur invalide");
        const res = await ResultatService.getNoteByQcm(user.id, qcmId);
        const payload = res?.data || {};
        setResult(payload);

        // 2) Charger le titre et les questions/réponses pour la correction
        try {
          const meta = await axios.get(`/qcm/${qcmId}`);
          setQcmTitle(meta?.data?.titre_qcm || `QCM #${qcmId}`);
        } catch { setQcmTitle(`QCM #${qcmId}`); }

        try {
          const list = await getQuestionsByQcm(qcmId);
          const arr = Array.isArray(list) ? list : [];
          const withAnswers = await Promise.all(arr.map(async (q) => {
            try {
              const reps = await getReponsesByQuestion(q.id_quest);
              const repsList = Array.isArray(reps) ? reps : [];
              return { ...q, reponses: repsList };
            } catch { return { ...q, reponses: [] }; }
          }));
          setQuestions(withAnswers);
        } catch {
          setQuestions([]);
        }
      } catch (e) {
        setError(e?.response?.data?.error || e?.message || 'Erreur de chargement du résultat');
      } finally {
        setLoading(false);
      }
    })();
  }, [qcmId, router]);

  const totalQuestions = useMemo(() => {
    const fromResult = Number(result?.total_questions);
    if (Number.isFinite(fromResult) && fromResult > 0) return fromResult;
    return Array.isArray(questions) ? questions.length : 0;
  }, [result, questions]);

  const noteSur20 = useMemo(() => {
    const n = Number(result?.note);
    return Number.isFinite(n) ? n : null;
  }, [result]);

  // Charger les choix de l'apprenant depuis localStorage (si disponibles)
  const chosenByQuestion = useMemo(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(`quiz:answers:${qcmId}`) : null;
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      const sel = parsed?.selected || {};
      // Normaliser en Set pour comparaison facile
      const map = {};
      Object.keys(sel).forEach((k) => {
        const arr = Array.isArray(sel[k]) ? sel[k] : [];
        map[String(k)] = new Set(arr.map(String));
      });
      return map;
    } catch {
      return {};
    }
  }, [qcmId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Résultat du quiz</h1>
            <p className="text-sm text-gray-600">{qcmTitle}</p>
          </div>
          <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-800">Retour</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-600">Chargement…</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border bg-gray-50 p-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">Votre note</div>
                <div className="text-lg font-semibold text-gray-900">
                  {noteSur20 != null ? `${noteSur20}/20` : '—'}
                  {totalQuestions ? (
                    <span className="ml-2 text-sm text-gray-600">({totalQuestions} question(s))</span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-sm text-gray-600">Aucune question disponible pour la correction.</div>
                ) : questions.map((q, idx) => (
                  <div key={q.id_quest || idx} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-gray-900">{idx + 1}. {q.quest}</div>
                      <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{q.point ?? 1} point(s)</div>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {(q.reponses || []).map((r) => {
                        const qKey = String(q.id_quest);
                        const isChosen = !!(chosenByQuestion[qKey]?.has && chosenByQuestion[qKey].has(String(r.id_rep)));
                        const isCorrect = !!r.est_correcte;
                        const baseClasses = 'text-sm flex items-center gap-2 px-2 py-1 rounded';
                        const stateClasses = isCorrect
                          ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                          : (isChosen ? 'text-red-800 bg-red-50 border border-red-200' : 'text-gray-800');
                        return (
                          <li key={r.id_rep} className={`${baseClasses} ${stateClasses}`}>
                            <span className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-emerald-500' : (isChosen ? 'bg-red-500' : 'bg-gray-300')}`}></span>
                            <span>{r.texte}</span>
                            {isCorrect ? <span className="ml-2 text-xs text-emerald-700">(bonne réponse)</span> : null}
                            {(!isCorrect && isChosen) ? <span className="ml-2 text-xs text-red-700">(votre choix — incorrect)</span> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



