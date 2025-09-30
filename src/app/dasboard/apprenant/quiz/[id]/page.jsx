'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuestionsByQcm } from '@/service/quiz.service';
import { getReponsesByQuestion } from '@/service/reponse.service';
import axios from '@/lib/axios';

export default function ApprenantQuizPage() {
  const params = useParams();
  const router = useRouter();
  const qcmId = useMemo(() => Number(params?.id), [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qcmTitle, setQcmTitle] = useState('');
  const [questions, setQuestions] = useState([]); // [{ id_quest, quest, point, reponses: [...] }]
  const [selected, setSelected] = useState({}); // { [id_quest]: Set<string> }
  const [submitted, setSubmitted] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [score, setScore] = useState({ totalPoints: 0, earnedPoints: 0 });

  useEffect(() => {
    if (!qcmId) return;
    loadQcm(qcmId);
  }, [qcmId]);

  // Vérifier si l'apprenant a déjà passé ce quiz
  useEffect(() => {
    try {
      const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!userData || !qcmId) return;
      const user = JSON.parse(userData);
      if (!user?.id) return;
      axios.get(`/resultat/note/${user.id}/${qcmId}`)
        .then(() => {
          setAlreadyTaken(true);
          setSubmitted(true);
        })
        .catch(() => {
          // 404 attendu si non encore passé
          setAlreadyTaken(false);
        });
    } catch {
      /* noop */
    }
  }, [qcmId]);

  const loadQcm = async (id) => {
    setLoading(true);
    setError('');
    try {
      // Optionally fetch QCM meta
      const qcmMeta = await axios.get(`/qcm/${id}`);
      setQcmTitle(qcmMeta?.data?.titre_qcm || `QCM #${id}`);

      const qs = await getQuestionsByQcm(id);
      const withAnswers = await Promise.all(
        (qs || []).map(async (q) => {
          try {
            const reps = await getReponsesByQuestion(q.id_quest);
            return { ...q, reponses: reps || [] };
          } catch {
            return { ...q, reponses: [] };
          }
        })
      );
      setQuestions(withAnswers);
      setSelected({});
      setSubmitted(false);
      setScore({ totalPoints: 0, earnedPoints: 0 });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Erreur de chargement du QCM');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (questionId, responseId, allowMultiple) => {
    setSelected((prev) => {
      const qKey = String(questionId);
      const rKey = String(responseId);
      if (!allowMultiple) {
        return { ...prev, [qKey]: new Set([rKey]) };
      }
      const current = new Set(prev[qKey] || []);
      if (current.has(rKey)) current.delete(rKey); else current.add(rKey);
      return { ...prev, [qKey]: current };
    });
  };

  const computeScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    for (const q of questions) {
      const qPoints = Number(q.point) || 1;
      totalPoints += qPoints;
      const correctIds = new Set(q.reponses.filter((r) => r.est_correcte).map((r) => String(r.id_rep)));
      const chosenIds = new Set([...(selected[String(q.id_quest)] || [])]);
      if (correctIds.size === chosenIds.size) {
        let allMatch = true;
        for (const id of correctIds) {
          if (!chosenIds.has(id)) { allMatch = false; break; }
        }
        if (allMatch) earnedPoints += qPoints;
      }
    }
    return { totalPoints, earnedPoints };
  };

  const handleSubmit = async () => {
    if (alreadyTaken) {
      alert('Vous avez déjà passé ce quiz.');
      return;
    }
    // Validation: au moins une réponse par question
    for (const q of questions) {
      const qKey = String(q.id_quest);
      if (!selected[qKey] || (selected[qKey] instanceof Set && selected[qKey].size === 0)) {
        alert('Veuillez répondre à toutes les questions.');
        return;
      }
    }
    const { totalPoints, earnedPoints } = computeScore();
    setScore({ totalPoints, earnedPoints });
    setSubmitted(true);

    // Enregistrer le résultat côté serveur puis rediriger vers les résultats
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        await axios.post('/resultat', {
          id_user: user.id,
          id_qcm: qcmId,
          note: Math.round((earnedPoints / (totalPoints || 1)) * 20),
          total_questions: questions.length,
        });
        // Aller à la page des résultats
        router.push('/dasboard/resultats');
      }
    } catch (e) {
      if (e?.response?.status === 409) {
        alert('Vous avez déjà passé ce quiz.');
        setAlreadyTaken(true);
        setSubmitted(true);
        return;
      }
      console.warn('Enregistrement du résultat échoué:', e?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{qcmTitle}</h1>
              <p className="text-sm text-gray-600">Sélectionnez les réponses et soumettez.</p>
            </div>
            <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-800">Retour</button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-600">Chargement des questions…</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : questions.length === 0 ? (
            <div className="text-center text-gray-600">Aucune question.</div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id_quest} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-gray-900">{idx + 1}. {q.quest}</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{q.point ?? 1} point(s)</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(() => {
                      const allowMultiple = (q.reponses || []).filter((rr) => rr.est_correcte).length > 1;
                      const qKey = String(q.id_quest);
                      const correctList = (q.reponses || []).filter((rr) => rr.est_correcte);
                      const isQuestionCorrect = (() => {
                        if (!submitted) return false;
                        const correctIds = new Set(correctList.map((r) => String(r.id_rep)));
                        const chosenIds = new Set([...(selected[qKey] || [])]);
                        if (correctIds.size !== chosenIds.size) return false;
                        for (const id of correctIds) if (!chosenIds.has(id)) return false;
                        return true;
                      })();
                      return q.reponses?.length ? q.reponses.map((r) => {
                        const isChosen = !!(selected[qKey]?.has && selected[qKey].has(String(r.id_rep)));
                        const baseText = 'text-sm select-none';
                        const colorWhenSubmitted = submitted
                          ? (r.est_correcte ? 'text-emerald-700' : (isChosen ? 'text-red-600' : 'text-gray-800'))
                          : 'text-gray-800';
                        return (
                        <label key={r.id_rep} className={`flex items-center gap-2 ${baseText} ${colorWhenSubmitted}`}>
                          <input
                            type={allowMultiple ? 'checkbox' : 'radio'}
                            name={`q-${q.id_quest}`}
                            className="accent-emerald-600 w-4 h-4 rounded"
                            checked={!!(selected[qKey]?.has && selected[qKey].has(String(r.id_rep)))}
                            onChange={() => toggleSelect(q.id_quest, r.id_rep, allowMultiple)}
                            disabled={submitted}
                          />
                          <span>{r.texte}</span>
                          {submitted && r.est_correcte ? (
                            <span className="text-emerald-600 text-xs">(bonne réponse)</span>
                          ) : null}
                          {submitted && !r.est_correcte && isChosen ? (
                            <span className="text-red-600 text-xs">(votre choix)</span>
                          ) : null}
                        </label>
                        );
                      }) : (
                        <div className="text-sm text-gray-500">Aucune réponse</div>
                      );
                    })()}
                  </div>
                  {submitted ? (
                    <div className="mt-3">
                      {(() => {
                        const correctTexts = (q.reponses || []).filter((r) => r.est_correcte).map((r) => r.texte);
                        const allowMultiple = (q.reponses || []).filter((rr) => rr.est_correcte).length > 1;
                        const qKey = String(q.id_quest);
                        const chosenIds = new Set([...(selected[qKey] || [])]);
                        const correctIds = new Set((q.reponses || []).filter((r) => r.est_correcte).map((r) => String(r.id_rep)));
                        let isCorrect = false;
                        if (correctIds.size === chosenIds.size) {
                          isCorrect = true;
                          for (const id of correctIds) { if (!chosenIds.has(id)) { isCorrect = false; break; } }
                        }
                        return (
                          <div className={`text-xs ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                            {isCorrect ? 'Bonne réponse.' : (
                              <>
                                Mauvaise réponse. {allowMultiple ? 'Bonnes réponses' : 'Bonne réponse'} : <span className="font-medium text-gray-800">{correctTexts.join(', ')}</span>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                {!submitted ? (
                  <button onClick={handleSubmit} disabled={alreadyTaken} className={`px-4 py-2 rounded-lg text-white ${alreadyTaken ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{alreadyTaken ? 'Quiz déjà passé' : 'Soumettre mes réponses'}</button>
                ) : (
                  <div className="text-sm text-gray-800">
                    Note: <span className="font-semibold">{score.earnedPoints}</span> / {score.totalPoints} points
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{Math.round((score.earnedPoints / (score.totalPoints || 1)) * 20)}/20</span>
                  </div>
                )}
                {!submitted && (
                  <button onClick={() => loadQcm(qcmId)} className="text-sm text-gray-600 hover:text-gray-800">Réinitialiser</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


