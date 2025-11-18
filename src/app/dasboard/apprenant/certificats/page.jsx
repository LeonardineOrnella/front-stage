"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, FileDown, Eye, Search } from "lucide-react";
import { ResultatService } from "@/service/resultat.service";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState([]);
  const [previewData, setPreviewData] = useState(null); // { id_form, titre_form, date }
  const [previewHtml, setPreviewHtml] = useState("");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return completed;
    return completed.filter((c) => String(c.titre_form || "").toLowerCase().includes(q));
  }, [completed, query]);

  useEffect(() => {
    const load = async () => {
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!userStr) {
          setCompleted([]);
          return;
        }
        const user = JSON.parse(userStr);
        // Backend spécifique non fourni: tentative via ResultatService
        // Attendu: liste des formations complétées (mock si non dispo)
        try {
          const res = await ResultatService.getAll();
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          // Filtrer arbitrairement: items avec statut "termine" et user_id = current
          const mine = list.filter((r) => String(r.id_user ?? r.user_id) === String(user.id) && (r.statut === 'termine' || r.completed === true));
          // Mapper au format { id_form, titre_form, date }
          const mapped = mine.map((r) => ({ id_form: r.id_form, titre_form: r.titre_form || r.formation || `Formation #${r.id_form}`, date: r.created_at || r.date || new Date().toISOString() }));
          setCompleted(mapped);
        } catch {
          // Fallback: vide
          setCompleted([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const generateCertificateHtml = (item, { withPrintScript } = { withPrintScript: false }) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const date = new Date();
    const dateStr = date.toLocaleDateString('fr-FR');
    const origin = window.location?.origin || '';
    const certificateId = `${Date.now()}-${user?.id || 'user'}-${item?.id_form || 'form'}`;
    const verifyUrl = `${origin}/verifier-certificat?code=${encodeURIComponent(certificateId)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;
    const establishment = 'UN‑IT';
    const logoUrl = `${origin}/UN-IT_Academy_1000x500.png`; // nouveau logo
    const fallbackLogoUrl = `${origin}/UN-IT%20Academy.png`; // fallback
    const learnerFullName = `${user.prenom || ''} ${user.nom || ''}`.trim() || '[Nom et Prénom]';
    const learnerEmail = user.email || '';
    const courseTitle = item.titre_form || '[Intitulé de la formation]';
    const endDate = item?.date ? new Date(item.date) : new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toLocaleDateString('fr-FR');
    const endDateStr = endDate.toLocaleDateString('fr-FR');
    const location = 'En ligne';
    const responsibleName = '[Nom du responsable]';
    
    const html = `
      <html>
        <head>
          <title>Certificat</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            * { box-sizing: border-box; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: #f5f7f9; padding: 0; }
            .sheet { background: #fff; margin: 24px auto; width: 297mm; height: 210mm; max-width: calc(100% - 48px); border: 1px solid #e5e7eb; border-radius: 14px; position: relative; overflow: hidden; page-break-after: avoid; page-break-before: avoid; }
            .break-after { page-break-after: always; }
            .frame { position: absolute; inset: 12px; border: 2px solid #0f766e20; border-radius: 12px; }
            .content { padding: 36px 40px; position: relative; z-index: 1; }
            .brand {
  display: flex;
  justify-content: center; /* centre horizontalement le logo */
  margin-bottom: 24px;
}
.brand img {
  height: 100px; /* ajustez selon la taille souhaitée */
  object-fit: contain;
}

            .decor { display: none; }
            .title { text-align: center; font-weight: 900; font-size: 32px; color: #0f766e; letter-spacing: .5px; text-transform: uppercase; }
            .subtitle { text-align: center; color: #374151; margin-top: 8px; font-size: 15px; }
            .block { margin-top: 28px; font-size: 16px; color: #111827; line-height: 1.7; }
            .line { display: inline-block; min-width: 220px; border-bottom: 1px dotted #9ca3af; }
            .strong { font-weight: 700; }
            .center { text-align: center; }
            .meta { margin-top: 22px; color: #374151; font-size: 15px; }
            .meta .row { margin: 6px 0; }
            .sign-area { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: end; }
            .sign { text-align: center; }
            .sign .sigline { margin-top: 32px; height: 1px; background: #e5e7eb; }
            .sign .label { margin-top: 8px; color: #6b7280; font-size: 12px; }
            .qr { width: 108px; height: 108px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 6px; background: #fff; }
            .bottom-row { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
            .verify-right { display: flex; align-items: center; justify-content: flex-end; }
            .footer { position: absolute; bottom: 24px; left: 0; right: 0; text-align: center; color: #9ca3af; font-size: 12px; }
            @media print {
              html, body { background: #fff; margin: 0; padding: 0; height: auto; }
              .sheet { margin: 0; border: none; width: 100%; height: auto; max-width: 100%; page-break-after: avoid; }
              .frame { border-color: #0f766e33; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="frame"></div>
            <div class="content">
              <div class="brand">
  <img src="${logoUrl}" alt="Logo UN‑IT Academy" onerror="this.onerror=null;this.src='${fallbackLogoUrl}';"/>
</div>

            <div class="title">Certificat de réussite</div>
              <div class="subtitle">Nous, soussignés ${establishment}, attestons par le présent document que :</div>

              <div class="block center"><span class="strong">Nom et Prénom</span> : <span class="line">${learnerFullName}</span></div>

              <div class="block center">a suivi avec succès la formation intitulée :</div>
              <div class="block center"><span class="strong">« ${courseTitle} »</span>, dispensée du <span class="line">${startDateStr}</span> au <span class="line">${endDateStr}</span>,</div>
              <div class="block center">et a démontré les compétences, les connaissances et l’assiduité requises pour sa validation.</div>

              <div class="meta">
                <div class="row">Ce certificat de réussite est délivré en reconnaissance de ses efforts, de son engagement et de sa performance tout au long du programme.</div>
                <div class="row">Fait à <span class="line">${location}</span>, le <span class="line">${dateStr}</span>.</div>
              </div>

              <div class="bottom-row">
                <div class="sign">
                  <div class="label">Signature et cachet</div>
                  <div class="label">${responsibleName}</div>
                </div>
                <div class="verify-right">
                  <img class="qr" src="${qrUrl}" alt="QR de vérification"/>
                </div>
              </div>

            </div>
          </div>
          ${withPrintScript ? '<script>window.onload = () => window.print();<\/script>' : ''}
        </body>
      </html>
    `;
    return html;
  };

  const handleDownload = (item) => {
    const win = window.open('', '_blank', 'width=1200,height=850');
    if (!win) return;
    const html = generateCertificateHtml(item, { withPrintScript: true });
    win.document.write(html);
    win.document.close();
  };

  const openPreview = (item) => {
    const html = generateCertificateHtml(item, { withPrintScript: false });
    setPreviewData(item);
    setPreviewHtml(html);
  };
  const closePreview = () => { setPreviewData(null); setPreviewHtml(""); };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-semibold">Mes certificats</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">{completed.length}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Téléchargez un certificat officiel pour chaque formation complétée.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une formation"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Démo rapide */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm text-emerald-900">
          {"Besoin d'un aperçu ? Générez un certificat de démonstration pour voir le rendu."}
        </div>
        <button
          onClick={() => openPreview({ id_form: 0, titre_form: 'Exemple de Formation', date: new Date().toISOString() })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Eye className="w-4 h-4" />
          Voir un exemple
        </button>
      </div>

        {loading ? (
        <div className="bg-white border rounded-xl p-6">Chargement…</div>
      ) : completed.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <Award className="w-7 h-7" />
          </div>
          <div className="font-medium text-gray-900">Aucun certificat disponible</div>
          <div className="text-sm text-gray-500">Vous n'avez pas encore complété de formation.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c.id_form} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{c.titre_form}</div>
                  <div className="text-xs text-gray-500 mt-1">Terminé le {new Date(c.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 border">Certificat</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openPreview(c)} className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  <Eye className="w-4 h-4" />
                  Aperçu
                </button>
                <button onClick={() => handleDownload(c)} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                  <FileDown className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Aperçu inline */}
      {previewData && (
        <div className="mt-6 bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-semibold">Aperçu du certificat</div>
            <button onClick={closePreview} className="text-sm text-gray-600 hover:text-gray-800">Fermer</button>
          </div>
          <div className="h-[70vh] bg-gray-100">
            <iframe title="preview-cert" className="w-full h-full bg-white" srcDoc={previewHtml}></iframe>
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
            <button onClick={closePreview} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Annuler</button>
            <button onClick={() => { const data = previewData; closePreview(); handleDownload(data); }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Télécharger</button>
          </div>
        </div>
      )}
    </div>
  )
}



