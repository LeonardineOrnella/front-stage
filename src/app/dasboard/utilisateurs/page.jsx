"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, Shield, GraduationCap } from 'lucide-react';

export default function UtilisateursPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/users');
        const list = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
        setUsers(list);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Erreur chargement utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchesRole = !roleFilter || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [u.nom, u.prenom, u.email, u.nom_user, u.prenom_user, u.email_user]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const total = users.length;
  const totalAdmins = users.filter(u => (u.role||'').toLowerCase()==='admin').length;
  const totalFormateurs = users.filter(u => (u.role||'').toLowerCase()==='formateur').length;
  const totalApprenants = users.filter(u => (u.role||'').toLowerCase()==='apprenant').length;

  const roleBadge = (role) => {
    const r = (role||'').toLowerCase();
    const styles = r === 'admin' ? 'bg-purple-100 text-purple-800'
      : r === 'formateur' ? 'bg-blue-100 text-blue-800'
      : r === 'apprenant' ? 'bg-emerald-100 text-emerald-800'
      : 'bg-gray-100 text-gray-700';
    const label = r ? r.charAt(0).toUpperCase() + r.slice(1) : '—';
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>{label}</span>;
  };

  const getDisplay = (u) => {
    const nom = u.nom || u.nom_user || '';
    const prenom = u.prenom || u.prenom_user || '';
    const email = u.email || u.email_user || '';
    const full = `${prenom} ${nom}`.trim();
    const initialsFrom = (prenom || nom || email || '').trim();
    const initials = initialsFrom ? initialsFrom[0].toUpperCase() : '?';
    return { nom, prenom, email, full, initials };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-7 border-b bg-gradient-to-r from-emerald-600 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
              <p className="text-sm text-emerald-50/90">Liste des comptes (admin requis)</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs border border-white/20"><Users className="w-4 h-4" /> {total}</span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-100 text-xs border border-white/20"><Shield className="w-4 h-4" /> {totalAdmins}</span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs border border-white/20"><GraduationCap className="w-4 h-4" /> {totalFormateurs}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border bg-white">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-2xl font-bold">{total}</div>
            </div>
            <div className="p-3 rounded-lg border bg-white">
              <div className="text-xs text-gray-500">Admins</div>
              <div className="text-2xl font-bold text-purple-700">{totalAdmins}</div>
            </div>
            <div className="p-3 rounded-lg border bg-white">
              <div className="text-xs text-gray-500">Formateurs</div>
              <div className="text-2xl font-bold text-blue-700">{totalFormateurs}</div>
            </div>
            <div className="p-3 rounded-lg border bg-white">
              <div className="text-xs text-gray-500">Apprenants</div>
              <div className="text-2xl font-bold text-emerald-700">{totalApprenants}</div>
            </div>
          </div>
          <div className="mt-4 px-6 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center border-t bg-white">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Rechercher (nom, prénom, email)"
                className="w-full border rounded-lg pl-11 pr-4 py-2"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/></svg>
            </div>
            <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="formateur">Formateur</option>
              <option value="apprenant">Apprenant</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-600">
              <div className="animate-pulse max-w-7xl mx-auto">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-600">
              <div className="max-w-md mx-auto p-6 bg-white rounded-xl border">
                <div className="text-lg font-semibold mb-1">Aucun utilisateur</div>
                <div className="text-sm">Essayez d'autres mots-clés ou changez le filtre de rôle.</div>
              </div>
            </div>
          ) : (
        <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="text-left px-4 py-2 font-medium">ID</th>
                    <th className="text-left px-4 py-2 font-medium">Utilisateur</th>
                    <th className="text-left px-4 py-2 font-medium">Email</th>
                    <th className="text-left px-4 py-2 font-medium">Rôle</th>
              </tr>
            </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="px-4 py-2">{u.id}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                            {getDisplay(u).initials}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{getDisplay(u).full || '—'}</div>
                            <div className="text-xs text-gray-500">{(u.nom||u.nom_user) && (u.prenom||u.prenom_user) ? '' : 'Nom non renseigné'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{getDisplay(u).email || '—'}</td>
                      <td className="px-4 py-2">{roleBadge(u.role)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
            </div>
          </div>
  );
}
