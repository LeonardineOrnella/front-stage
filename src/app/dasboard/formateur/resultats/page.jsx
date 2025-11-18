"use client";
import { useEffect, useState } from "react";
import { formationService } from "@/service/formation.service";
import { ResultatService } from "@/service/resultat.service";

export default function ResultatsPage() {
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formationFilter, setFormationFilter] = useState("");
  const [formationsList, setFormationsList] = useState([]);
  const [showByLearner] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // { user_id, nom_prenom }
  const [sortBy, setSortBy] = useState({ key: 'id_resultat', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchResultats();
    fetchFormations();
  }, []);

  const fetchResultats = async () => {
    try {
      const res = await ResultatService.getAll();
      const raw = Array.isArray(res?.data) ? res.data : [];
      // Normaliser les champs pour l'affichage du tableau
      const normalized = raw.map((r) => {
        const note = r.note ?? r.NOTE ?? 0;
        const totalQuestions = r.total_questions ?? r.total ?? r.nb_questions ?? 0;
        const idQcm = r.id_qcm ?? r.qcm_id ?? r.idQcm;
        const userId = r.id_user ?? r.id ?? r.user_id;
        const nom = r.nom ?? r.last_name ?? '';
        const prenom = r.prenom ?? r.first_name ?? '';
        const nomPrenom = r.nom_prenom || `${prenom} ${nom}`.trim();
        const formationTitle = r.titre_form || r.formation || r.nom_formation || '';
        const chapitreTitle = r.titre_qcm || r.chapitre || r.nom_chapitre || (idQcm ? `QCM #${idQcm}` : '—');
        return {
          ...r,
          id_resultat: r.id_resultat ?? r.id_result ?? r.id,
          id_qcm: idQcm,
          total_questions: totalQuestions,
          note: Number(note),
          user_id: userId,
          formation_display: formationTitle || '—',
          chapitre_display: chapitreTitle || '—',
          formation: formationTitle || chapitreTitle || '—',
          nom_prenom: nomPrenom || (userId ? `Utilisateur #${userId}` : '—'),
        };
      });
      setResultats(normalized);
      console.log(raw);
      
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormations = async () => {
    try {
      const data = await formationService.getAllFormations();
      setFormationsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des formations:", err);
      setFormationsList([]);
    }
  };

  // Filtrage optionnel
  const filteredResultats = resultats.filter((r) => {
    const userMatch = search
      ? r.nom_prenom?.toLowerCase().includes(search.toLowerCase())
      : true;

    const formationMatch = formationFilter
      ? r.formation?.toLowerCase() === formationFilter.toLowerCase()
      : true;

    return userMatch && formationMatch;
  });

  // Sorting
  const sortedResultats = [...filteredResultats].sort((a, b) => {
    const dir = sortBy.direction === 'asc' ? 1 : -1;
    const av = a[sortBy.key];
    const bv = b[sortBy.key];
    if (av == null && bv == null) return 0;
    if (av == null) return -1 * dir;
    if (bv == null) return 1 * dir;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  // Pagination
  const totalItems = sortedResultats.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedResultats = sortedResultats.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const changeSort = (key) => {
    setSortBy((prev) => (
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    ));
  };

  const exportCsv = () => {
    const rows = sortedResultats.map((r) => ({
      nom_prenom: r.nom_prenom,
      formation: r.formation_display,
      chapitre: r.chapitre_display,
      note: r.note,
    }));
    const header = Object.keys(rows[0] || { nom_prenom: '', formation: '', chapitre: '', note: '' });
    const escape = (val) => {
      if (val == null) return '';
      const s = String(val).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [header.join(','), ...rows.map((row) => header.map((h) => escape(row[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultats.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formationOptions = formationsList?.length
    ? formationsList.map((f) => f.titre_form)
    : [...new Set(resultats.map((r) => r.formation_display).filter(Boolean))];

  // Regrouper par utilisateur dans une formation: notes et moyenne
  const userFormationStats = (() => {
    const map = new Map();
    for (const r of filteredResultats) {
      const key = `${r.nom_prenom || ''}||${r.formation || ''}`;
      const current = map.get(key) || {
        nom_prenom: r.nom_prenom || '—',
        formation: r.formation || '—',
        notes: [],
      };
      const noteValue = Number(r.note);
      current.notes.push(Number.isFinite(noteValue) ? noteValue : 0);
      map.set(key, current);
    }
    return Array.from(map.values()).map((entry) => {
      const total = entry.notes.reduce((a, b) => a + b, 0);
      const count = entry.notes.length || 0;
      const moyenne = count ? (total / count) : 0;
      return {
        ...entry,
        count,
        moyenne: Number.isFinite(moyenne) ? Number(moyenne.toFixed(2)) : 0,
      };
    });
  })();

  function groupByLearnerAndFormation(results) {
    const map = new Map();
    for (const r of results) {
      const userId = r.user_id || r.id_user;
      if (!userId) continue;
      const formation = r.formation_display || r.formation || '—';
      const key = `${userId}||${formation}`;
      const entry = map.get(key) || { user_id: userId, nom_prenom: r.nom_prenom || `Utilisateur #${userId}`, formation, items: [] };
      entry.items.push(r);
      map.set(key, entry);
    }
    return Array.from(map.values());
  }

  function LearnersView({ loading, results, onOpenUser }) {
    const rows = groupByLearnerAndFormation(results);
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Vue par apprenant</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun apprenant.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Nom & Prénom</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Formation</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Evaluations</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Moyenne</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const notes = row.items.map(i => Number(i.note) || 0);
                  const moyenne = notes.length ? (notes.reduce((a,b)=>a+b,0)/notes.length).toFixed(2) : '0.00';
                  return (
                    <tr key={`${row.user_id}-${row.formation}`}>
                      <td className="px-6 py-3 font-medium text-gray-900">{row.nom_prenom}</td>
                      <td className="px-6 py-3">{row.formation}</td>
                      <td className="px-6 py-3">{row.items.length}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${Number(moyenne) >= 15 ? 'bg-green-100 text-green-800' : Number(moyenne) >= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{moyenne}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => onOpenUser({ user_id: row.user_id, nom_prenom: row.nom_prenom, formation: row.formation })}
                          className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
                          type="button"
                        >
                          Voir toutes les notes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function UserNotesModal({ user, results, onClose }) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Apprenant</div>
              <div className="text-lg font-semibold text-gray-900">{user?.nom_prenom}</div>
              {user?.formation ? (
                <div className="text-xs text-gray-600">Formation: {user.formation}</div>
              ) : null}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="p-6">
            {(!results || results.length === 0) ? (
              <div className="text-gray-600">Aucune note.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {!user?.formation && (<th className="px-4 py-2 text-left font-medium text-gray-600">Formation</th>)}
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Chapitre</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((r) => (
                      <tr key={r.id_resultat}>
                        {!user?.formation && (<td className="px-4 py-2">{r.formation_display}</td>)}
                        <td className="px-4 py-2">{r.chapitre_display}</td>
                        <td className="px-4 py-2">{Number(r.note)}/20</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t flex items-center justify-between text-sm">
            <div className="text-gray-700">
              Moyenne: {(() => {
                const notes = (results || []).map(r => Number(r.note) || 0);
                const avg = notes.length ? (notes.reduce((a,b)=>a+b,0)/notes.length).toFixed(2) : '0.00';
                return avg;
              })()}
            </div>
            <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50">Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec gradient */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-l-4 border-indigo-500">
          <h1 className="text-xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Résultats des apprenants
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-lg text-gray-600 font-medium">
              Total 
              <span className="ml-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                {totalItems}
              </span>
            </p>
            <button onClick={exportCsv} className="ml-auto px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700">Exporter CSV</button>
          </div>
        </div>

        {/* Barre de recherche et filtre améliorée */
        }
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={'Rechercher un apprenant'}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative max-w-xs w-full lg:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <select
                className="block w-full pl-10 pr-8 py-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer"
                value={formationFilter}
                onChange={(e) => setFormationFilter(e.target.value)}
              >
                <option value="">Toutes les formations</option>
                {formationOptions.map((f, idx) => (
                  <option key={idx} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vue conditionnelle: liste détaillée OU vue par apprenant */}
        {showByLearner ? (
          <LearnersView
            loading={loading}
            results={filteredResultats}
            onOpenUser={(user) => setSelectedUser(user)}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Chargement…</p>
                </div>
              </div>
            ) : filteredResultats.length === 0 ? (
              <div className="text-center p-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.464-.878-6.071-2.314C5.77 12.12 5.457 11.926 5.2 11.64c-1.218-1.356-2.077-2.95-2.454-4.64C2.519 5.52 3.91 4 5.5 4h13c1.59 0 2.981 1.52 2.754 3 -.377 1.69-1.236 3.284-2.454 4.64-.257.286-.57.48-.729.074C17.464 10.122 15.34 9 13 9s-4.464 1.122-6.071 2.686z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</h3>
                <p className="text-gray-500">Ajustez vos filtres ou réessayez plus tard.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th onClick={() => changeSort('nom_prenom')} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer select-none">
                        Nom {sortBy.key === 'nom_prenom' ? (sortBy.direction === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => changeSort('formation_display')} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer select-none">
                        Formation {sortBy.key === 'formation_display' ? (sortBy.direction === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => changeSort('chapitre_display')} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer select-none">
                        Chapitre {sortBy.key === 'chapitre_display' ? (sortBy.direction === 'asc' ? '▲' : '▼') : ''} 
                      </th>
                      <th onClick={() => changeSort('note')} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer select-none">
                        Note {sortBy.key === 'note' ? (sortBy.direction === 'asc' ? '▲' : '▼') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pagedResultats.map((r, index) => (
                      <tr
                        key={r.id_resultat}
                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {r.nom_prenom?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{r.nom_prenom}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {r.formation_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {r.chapitre_display}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              r.note >= 15 ? 'bg-green-100 text-green-800' :
                              r.note >= 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {r.note}/20
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination controls */}
                <div className="flex items-center justify-between p-4">
                  <div className="text-sm text-gray-600">Page {currentPage} / {totalPages}</div>
                  <div className="flex items-center gap-2">
                    <button disabled={currentPage === 1} onClick={() => setPage(1)} className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{'<<'}</button>
                    <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{'<'}</button>
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded text-sm">
                      {[5,10,20,50].map((s) => <option key={s} value={s}>{s}/page</option>)}
                    </select>
                    <button disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{'>'}</button>
                    <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)} className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{'>>'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    {/* Modal: toutes les notes d'un apprenant */}
    {selectedUser && (
      <UserNotesModal
        user={selectedUser}
        results={resultats.filter(r => r.user_id === selectedUser.user_id)}
        onClose={() => setSelectedUser(null)}
      />
    )}
    </>
  );
}