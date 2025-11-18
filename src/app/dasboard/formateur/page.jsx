"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formateurService } from '@/service/formateur.service';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export default function FormateurCrudPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null); // { id, ... } | null
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mdp: '' });
  const [viewItem, setViewItem] = useState(null); // détails formateur
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [newPwdConfirm, setNewPwdConfirm] = useState('');
  const [resettingPwd, setResettingPwd] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const Portal = ({ children }) => {
    if (typeof window === 'undefined') return null;
    return createPortal(children, document.body);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await formateurService.getAllFormateurs();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setItems(list);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Erreur chargement formateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((it) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const values = [it.nom, it.prenom, it.email, it.nom_user, it.prenom_user, it.email_user]
      .filter(Boolean)
      .map(v => String(v).toLowerCase());
    return values.some(v => v.includes(q));
  });
  const total = items.length;

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: '', prenom: '', email: '', mdp: '' });
    setIsOpen(true);
  };

  const openEdit = (it) => {
    setEditing(it);
    setForm({
      nom: it.nom || it.nom_user || '',
      prenom: it.prenom || it.prenom_user || '',
      email: it.email || it.email_user || '',
      mdp: '',
    });
    setViewItem(null);
    setDeleteItem(null);
    setIsOpen(true);
  };

  const closeModal = () => { setIsOpen(false); };

  const save = async (e) => {
    e.preventDefault();
    // Validations côté client
    if (!form.nom?.trim() || !form.prenom?.trim()) {
      toast.error('Nom et prénom sont requis');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email||'').trim());
    if (!emailOk) {
      toast.error("L'email n'est pas valide");
      return;
    }
    // Si création (pas édition), mdp requis !
    if (!editing && (!form.mdp || String(form.mdp).trim().length < 6)) {
      toast.error('Le mot de passe est requis et doit contenir au moins 6 caractères !');
      return;
    }
    try {
      if (editing?.id) {
        const updated = await formateurService.updateFormateur(editing.id, form);
        setItems((prev) => prev.map((it) => (it.id === editing.id ? { ...it, ...form, ...(updated || {}) } : it)));
        toast.success('Formateur mis à jour');
      } else {
        // Création : mdp toujours envoyé (le champ est toujours affiché et required dans le form)
        const created = await formateurService.createFormateur(form);
        setItems((prev) => [{ ...(created || {}), ...form, id: created?.id || created?.data?.id }, ...prev]);
        toast.success('Formateur créé');
      }
      setIsOpen(false);
    } catch (e2) {
      const apiMsg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message;
      toast.error(apiMsg || (editing?.id ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création'));
    }
  };

  const remove = async (id) => {
    try {
      setDeletingId(id);
      await formateurService.deleteFormateur(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success('Formateur supprimé');
    } catch (e2) {
      toast.error(e2?.response?.data?.message || e2?.message || 'Erreur suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Formateurs</h1>
              <p className="text-sm text-gray-600">Gestion des formateurs (CRUD)</p>
            </div>
            <button onClick={openCreate} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Nouveau</button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border bg-white">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold">{total}</div>
            </div>
            <div className="sm:col-span-3 flex items-center gap-3">
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Rechercher (nom, prénom, email)"
                className="flex-1 border rounded-lg px-3 py-2 bg-white"
              />
              <div className="text-sm text-gray-600">{filtered.length} affichés</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-600">Chargement…</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-600">Aucun formateur.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="text-left px-4 py-2 font-medium">ID</th>
                    <th className="text-left px-4 py-2 font-medium">Nom</th>
                    <th className="text-left px-4 py-2 font-medium">Prénom</th>
                    <th className="text-left px-4 py-2 font-medium">Email</th>
                    <th className="text-right px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-4 py-2">{it.id}</td>
                      <td className="px-4 py-2">{it.nom || it.nom_user}</td>
                      <td className="px-4 py-2">{it.prenom || it.prenom_user}</td>
                      <td className="px-4 py-2">{it.email || it.email_user}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                  type="button"
                          onClick={() => { setIsOpen(false); setViewItem({ ...it }); setNewPwd(''); setShowPwd(false); }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-gray-50"
                          title="Détails"
                          aria-label="Détails"
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                </button>
                        <button
                          onClick={() => openEdit(it)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-gray-50"
                          title="Modifier"
                          aria-label="Modifier"
                        >
                          <Pencil className="w-4 h-4 text-gray-700" />
                    </button>
                        <button
                          onClick={() => { setIsOpen(false); setDeleteItem(it); }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          title="Supprimer"
                          aria-label="Supprimer"
                          disabled={deletingId === it.id}
                        >
                          {deletingId === it.id ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editing ? 'Modifier le formateur' : 'Nouveau formateur'}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600">Nom</label>
                <input value={form.nom} onChange={(e)=>setForm(f=>({...f, nom:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Prénom</label>
                <input value={form.prenom} onChange={(e)=>setForm(f=>({...f, prenom:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input type="email" value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
          </div>
              {!editing && (
                <div>
                  <label className="block text-sm text-gray-600">Mot de passe</label>
                  <input type="password" value={form.mdp} onChange={(e)=>setForm(f=>({...f, mdp:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Min. 6 caractères" required />
        </div>
      )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded border hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">{editing ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détails + réinitialisation mot de passe */}
      {viewItem && (
        <Portal>
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md pointer-events-auto">
              <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Détails du formateur</h3>
              <button type="button" onClick={() => setViewItem(null)} className="text-gray-500 hover:text-gray-700" aria-label="Fermer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-600">Nom</div>
                <div className="text-base text-gray-900 font-medium">{viewItem.nom || viewItem.nom_user}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Prénom</div>
                <div className="text-base text-gray-900 font-medium">{viewItem.prenom || viewItem.prenom_user}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="text-base text-gray-900 font-medium">{viewItem.email || viewItem.email_user}</div>
              </div>
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button onClick={() => setViewItem(null)} className="px-4 py-2 rounded border hover:bg-gray-50">Fermer</button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteItem && (
        <Portal>
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md pointer-events-auto">
              <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-600">Confirmer la suppression</h3>
              <button type="button" onClick={() => setDeleteItem(null)} className="text-gray-500 hover:text-gray-700" aria-label="Fermer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Voulez-vous vraiment supprimer
                {' '}<span className="font-medium">{deleteItem.prenom || deleteItem.prenom_user} {deleteItem.nom || deleteItem.nom_user}</span>
                {' '}? Cette action est irréversible.
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setDeleteItem(null)} className="px-4 py-2 rounded border hover:bg-gray-50">Annuler</button>
                  <button
                  type="button"
                  onClick={async () => { await remove(deleteItem.id); setDeleteItem(null); }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  disabled={deletingId === deleteItem.id}
                  >
                    {deletingId === deleteItem.id ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
            </div>
          </div>
          </div>
        </Portal>
      )}
      {/* spécialité supprimée */}
      <div className="pt-2 hidden"></div>
    </div>
  );
}
