"use client";
import { useEffect, useState } from "react";
import { formationService } from "@/service/formation.service";
import { liveService } from "@/service/live.service";
import RequireRole from "@/components/backoOffice/RequireRole";
 

export default function LivesApprenantPage() {
  const [formationsById, setFormationsById] = useState({});
  const [lives, setLives] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [allLives, allForms] = await Promise.all([
        liveService.list(),
        formationService.getAllFormations()
      ]);
      if (!mounted) return;
      setLives(Array.isArray(allLives) ? allLives : []);
      const map = {};
      (Array.isArray(allForms) ? allForms : []).forEach(f => { map[f.id_form] = f; });
      setFormationsById(map);
    })();
    return () => { mounted = false };
  }, []);

  return (
    <RequireRole roles={["apprenant","admin","formateur"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
            <h1 className="text-xl font-bold text-gray-900">Lives et webinaires</h1>
            <p className="text-sm text-gray-600">Participez à vos sessions en direct</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b text-sm text-gray-700">Liste des lives</div>
              {lives.length === 0 ? (
                <div className="p-4 text-gray-600">Aucun live prévu pour le moment.</div>
              ) : (
                <ul className="divide-y">
                  {lives.map(l => {
                    const liveDate = new Date(l.dateheure_live);
                    const now = new Date();
                    const isLiveFinished = now > liveDate;
                    const isLiveStarted = now >= liveDate;
                    
                    return (
                      <li key={l.id_live} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{l.titre_live}</div>
                          <div className="text-sm text-gray-600">
                            {liveDate.toLocaleString()} • {l.duree_live || '—'}
                            {isLiveFinished && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Terminé
                              </span>
                            )}
                            {!isLiveStarted && !isLiveFinished && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                À venir
                              </span>
                            )}
                            {isLiveStarted && !isLiveFinished && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                En direct
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Formation: {formationsById[l.id_form]?.titre_form || l.id_form}</div>
                        </div>
                        {l.lien ? (
                          isLiveFinished ? (
                            <span className="px-3 py-1 rounded bg-gray-400 text-white text-sm cursor-not-allowed opacity-50">
                              Terminé
                            </span>
                          ) : (
                            <a 
                              className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm" 
                              href={l.lien} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              {isLiveStarted ? 'Rejoindre' : 'Programmé'}
                            </a>
                          )
                        ) : (
                          <span className="px-3 py-1 rounded bg-gray-400 text-white text-sm cursor-not-allowed opacity-50">
                            Lien indisponible
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}


