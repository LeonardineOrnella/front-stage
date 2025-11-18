"use client";
import { useEffect, useState } from "react";
import { formationService } from "@/service/formation.service";
import { liveService } from "@/service/live.service";
import { Plus, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/backoOffice/ConfirmModal";
import { toast } from "react-toastify";
import RequireRole from "@/components/backoOffice/RequireRole";
import api from "@/lib/axios";
import integrations from "@/lib/integrations";
 

export default function LivesFormateurPage() {
  const [formations, setFormations] = useState([]);
  const [formationId, setFormationId] = useState("");
  const [lives, setLives] = useState([]);
  const [form, setForm] = useState({ titre_live: "", dateheure_live: "", lien: "" });
  const [provider, setProvider] = useState("zoom"); // zoom | google
  const [isCreating, setIsCreating] = useState(false);
  const [confirmState, setConfirmState] = useState({ open:false, title:'', message:'', onConfirm:null });

  useEffect(() => {
    formationService.getAllFormations().then((d)=>setFormations(Array.isArray(d)?d:[]));
  }, []);

  useEffect(() => {
    if (!formationId) {
      // Liste tous les lives pour consultation sans filtre
      liveService.list().then((d)=>setLives(Array.isArray(d)?d:[]));
      return;
    }
    liveService.listByFormation(Number(formationId)).then((d)=>setLives(Array.isArray(d)?d:[]));
  }, [formationId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!formationId || !form.titre_live || !form.dateheure_live) { toast.error('Veuillez remplir tous les champs'); return; }
    try {
      setIsCreating(true);

      let meetingLink = form.lien?.trim();
      if ((provider === 'zoom' || provider === 'google') && !meetingLink) {
        try {
          const isoStart = new Date(form.dateheure_live).toISOString();
          if (provider === 'zoom') {
            const res = await integrations.post('/integrations/zoom/meetings', {
              topic: form.titre_live,
              start_time: isoStart,
              // you can add duration/timezone as needed
            });
            meetingLink = res?.data?.join_url || res?.data?.data?.join_url || '';
          } else if (provider === 'google') {
            const res = await integrations.post('/integrations/google/meetings', {
              summary: form.titre_live,
              start: isoStart,
            });
            meetingLink = res?.data?.hangoutLink || res?.data?.data?.hangoutLink || '';
          }
        } catch (err) {
          toast.error(err?.response?.data?.error || `Échec de création de la réunion ${provider === 'zoom' ? 'Zoom' : 'Google Meet'}.`);
          // fallback: stop creation to avoid empty link
          return;
        }
      }

      await liveService.create({ ...form, lien: meetingLink, id_form: Number(formationId) });
      toast.success('Live créé');
      setForm({ titre_live: "", dateheure_live: "", duree_live: "", lien: "" });
      setProvider('manual');
      const d = await liveService.listByFormation(Number(formationId));
      setLives(Array.isArray(d)?d:[]);
    } catch (e2) {
      toast.error(e2?.response?.data?.error || e2?.message || 'Échec de création du live');
    } finally { setIsCreating(false); }
  };

  const remove = (id_live) => {
    setConfirmState({
      open: true,
      title: 'Supprimer le live',
      message: 'Confirmez-vous la suppression de ce live ?',
      onConfirm: async () => {
        await liveService.remove(id_live);
        setLives(prev=>prev.filter(l=>l.id_live!==id_live));
        setConfirmState((s)=>({ ...s, open:false }));
      }
    });
  };

  return (
    <RequireRole roles={["formateur","admin"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
            <h1 className="text-xl font-bold text-gray-900">Lives</h1>
            <p className="text-sm text-gray-600">Planifiez et gérez vos sessions en direct</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-700">Formation</label>
              <select value={formationId} onChange={(e)=>setFormationId(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="">— Sélectionner —</option>
                {formations.map((f)=>(<option key={f.id_form} value={f.id_form}>{f.titre_form}</option>))}
              </select>
            </div>

            <form onSubmit={submit} className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-sm text-gray-700">Titre du live</label>
                <input value={form.titre_live} onChange={(e)=>setForm(v=>({...v,titre_live:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Date et heure</label>
                <input 
                  type="datetime-local" 
                  value={form.dateheure_live} 
                  onChange={(e)=>setForm(v=>({...v,dateheure_live:e.target.value}))} 
                  min={new Date().toISOString().slice(0, 16)}
                  className="mt-1 w-full border rounded-lg px-3 py-2" 
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Fournisseur</label>
                <select value={provider} onChange={(e)=>setProvider(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                  <option value="zoom">Zoom (auto)</option>
                  <option value="google">Google Meet (auto)</option>
                </select>
              </div>
              <div className="hidden">
                <label className="text-sm text-gray-700">Lien du live (auto)</label>
                <input readOnly value={form.lien} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100" />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button type="submit" disabled={!formationId || isCreating} className={`px-4 py-2 rounded-lg text-white ${!formationId||isCreating?"bg-gray-400":"bg-emerald-600 hover:bg-emerald-700"}`}>
                  <Plus className="w-4 h-4 inline mr-2" /> Créer un live
                </button>
              </div>
            </form>

            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b text-sm text-gray-700">Lives planifiés</div>
              {lives.length === 0 ? (
                <div className="p-4 text-gray-600">Aucun live</div>
              ) : (
                <ul className="divide-y">
                  {lives.map(l => {
                    const liveDate = new Date(l.dateheure_live);
                    const now = new Date();
                    const isLiveFinished = now > liveDate;
                    const isLiveStarted = now >= liveDate;
                    
                    return (
                      <li key={l.id_live} className="p-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900">{l.titre_live}</div>
                          <div className="text-sm text-gray-600">
                            {liveDate.toLocaleString()}
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
                          {l.lien ? (
                            isLiveFinished ? (
                              <span className="text-gray-500 text-sm cursor-not-allowed opacity-50">Lien indisponible</span>
                            ) : (
                              <a 
                                className="text-emerald-700 text-sm hover:text-emerald-800" 
                                href={l.lien} 
                                target="_blank" 
                                rel="noreferrer"
                              >
                                {isLiveStarted ? 'Rejoindre' : 'Planifié'}
                              </a>
                            )
                          ) : (
                            <span className="text-gray-500 text-sm">Aucun lien fourni</span>
                          )}
                        </div>
                        <button onClick={()=>remove(l.id_live)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">
                          <Trash2 className="w-4 h-4 inline" /> Supprimer
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s)=>({ ...s, open:false }))}
      />
    </RequireRole>
  );
}


