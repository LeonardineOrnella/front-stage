"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formationService } from "@/service/formation.service";
import { chapService } from "@/service/chap.service";
import { ressourceService } from "@/service/ressource.service";
import { toast } from "react-toastify";
import RequireRole from "@/components/backoOffice/RequireRole";
import ConfirmModal from "@/components/backoOffice/ConfirmModal";
 

export default function RessourcesFormateur() {
  const search = useSearchParams();
  const [formations, setFormations] = useState([]);
  const [formationId, setFormationId] = useState("");
  const [chapitres, setChapitres] = useState([]);
  const [chapitreId, setChapitreId] = useState("");
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({ open:false, title:'', message:'', onConfirm:null });

  const [type, setType] = useState("pdf");
  const [file, setFile] = useState(null);

  useEffect(() => {
    formationService.getAllFormations().then((data) => setFormations(Array.isArray(data) ? data : [])).catch(() => setFormations([]));
  }, []);

  useEffect(() => {
    const fid = search?.get("formationId");
    if (fid) setFormationId(fid);
  }, [search]);

  useEffect(() => {
    if (!formationId) {
      setChapitres([]);
      setChapitreId("");
      setRessources([]);
      return;
    }
    chapService.getByFormation(Number(formationId)).then((list) => setChapitres(Array.isArray(list) ? list : [])).catch(() => setChapitres([]));
  }, [formationId]);

  useEffect(() => {
    if (!chapitreId) { setRessources([]); return; }
    ressourceService.listByChapitre(Number(chapitreId)).then((list) => setRessources(Array.isArray(list) ? list : [])).catch(() => setRessources([]));
  }, [chapitreId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!chapitreId) { toast.error('Veuillez sélectionner un chapitre'); return; }
    if (!file) { toast.error('Veuillez choisir un fichier'); return; }
    try {
      setLoading(true);
      await ressourceService.create({ id_chap: Number(chapitreId), type, file });
      toast.success('Ressource ajoutée');
      setFile(null);
      const input = document.getElementById("file-input");
      if (input) input.value = "";
      const list = await ressourceService.listByChapitre(Number(chapitreId));
      setRessources(Array.isArray(list) ? list : []);
    } catch (e2) {
      toast.error(e2?.response?.data?.error || e2?.message || 'Erreur lors du téléversement');
    } finally {
      setLoading(false);
    }
  };

  const remove = (id_res) => {
    setConfirmState({
      open: true,
      title: 'Supprimer la ressource',
      message: 'Êtes-vous sûr de vouloir supprimer cette ressource ?',
      onConfirm: async () => {
        try {
          await ressourceService.remove(id_res);
          setRessources((prev) => prev.filter((r) => r.id_res !== id_res));
          toast.success('Ressource supprimée');
        } catch (e2) {
          toast.error(e2?.response?.data?.error || e2?.message || 'Erreur lors de la suppression');
        } finally {
          setConfirmState((s)=>({ ...s, open:false }));
        }
      }
    });
  };

  const filteredChapitres = useMemo(() => chapitres.sort((a,b) => (a.ordre||0)-(b.ordre||0)), [chapitres]);

  return (
    <RequireRole roles={["formateur","admin"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
            <h1 className="text-xl font-bold text-gray-900">Ressources des chapitres</h1>
            <p className="text-sm text-gray-600">Ajoutez et gérez les ressources de vos formations</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Formation</label>
                <select value={formationId} onChange={(e)=>setFormationId(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">— Sélectionner —</option>
                  {formations.map((f) => (
                    <option key={f.id_form} value={f.id_form}>{f.titre_form}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Chapitre</label>
                <select value={chapitreId} onChange={(e)=>setChapitreId(e.target.value)} disabled={!formationId} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-60">
                  <option value="">— Sélectionner —</option>
                  {filteredChapitres.map((c) => (
                    <option key={c.id_chap} value={c.id_chap}>{c.ordre ? `${c.ordre}. ` : ''}{c.titre_chap}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={submit} className="rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-sm text-gray-700">Type</label>
                  <select value={type} onChange={(e)=>setType(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="pdf">PDF</option>
                    <option value="video">Vidéo</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-700">Fichier</label>
                  <input id="file-input" type="file" accept="application/pdf,video/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={!chapitreId || !file || loading} className={`px-4 py-2 rounded-lg text-white ${(!chapitreId || !file || loading) ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                  {loading ? 'Envoi en cours…' : 'Ajouter'}
                </button>
              </div>
            </form>

            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b text-sm text-gray-700">Ressources du chapitre</div>
              {(!chapitreId) ? (
                <div className="p-4 text-gray-600">Sélectionnez un chapitre pour voir ses ressources</div>
              ) : ressources.length === 0 ? (
                <div className="p-4 text-gray-600">Aucune ressource</div>
              ) : (
                <ul className="divide-y">
                  {ressources.map((r) => (
                    <li key={r.id_res} className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">{r.type?.toUpperCase() || "RESSOURCE"}</div>
                        {r.url ? <div className="text-sm text-gray-600 break-all">{r.url}</div> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {r.url ? (
                          <a
                            href={r.url?.startsWith('/uploads/') ? `http://localhost:3001${r.url}` : r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded border hover:bg-gray-50 text-sm"
                          >
                            Ouvrir
                          </a>
                        ) : null}
                        <button type="button" onClick={() => remove(r.id_res)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">Supprimer</button>
                      </div>
                    </li>
                  ))}
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

