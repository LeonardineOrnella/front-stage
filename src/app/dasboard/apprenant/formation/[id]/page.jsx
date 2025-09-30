'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formationService } from '@/service/formation.service';

export default function FormationSuiviPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = useMemo(() => params?.id, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formation, setFormation] = useState(null);

  useEffect(() => {
    if (!formationId) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await formationService.getFormationById(formationId);
        setFormation(data || null);
      } catch (e) {
        setError(e?.message || 'Erreur de chargement de la formation');
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{formation?.titre_form || 'Formation'}</h1>
            <p className="text-sm text-gray-600">Suivez le contenu chapitre par chapitre.</p>
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
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Présentation</h2>
                <p className="text-gray-700">{formation.description || '—'}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Chapitres</h2>
                {formation.chapitres?.length ? (
                  <ol className="space-y-2 list-decimal pl-6">
                    {formation.chapitres.map((c) => (
                      <li key={c.id_chap} className="border rounded p-3">
                        <div className="font-medium text-gray-900">{c.titre_chap || c.titre || 'Chapitre'}</div>
                        {c.description ? <div className="text-sm text-gray-600">{c.description}</div> : null}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-sm text-gray-600">Aucun chapitre disponible pour le moment.</div>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Commencer / Continuer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


