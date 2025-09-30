"use client";

import { useEffect, useMemo, useState } from "react";
import { ResultatService } from "@/service/resultat.service";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState([]);

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

  const handleDownload = (item) => {
    // Générer un certificat simple imprimable
    const win = window.open('', '_blank', 'width=1200,height=850');
    if (!win) return;
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const date = new Date();
    const dateStr = date.toLocaleDateString('fr-FR');
    const origin = window.location?.origin || '';
    const certificateId = `${Date.now()}-${user?.id || 'user'}-${item?.id_form || 'form'}`;
    const verifyUrl = `${origin}/verifier-certificat?code=${encodeURIComponent(certificateId)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;
    const establishment = 'UN‑IT';
    const logoUrl = `${origin}/un-it-logo.png`;
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
            @page { size: A4 landscape; margin: 10mm; }
            * { box-sizing: border-box; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: #f5f7f9; padding: 0; }
            .sheet { background: #fff; margin: 24px auto; width: 297mm; height: 210mm; max-width: calc(100% - 48px); border: 1px solid #e5e7eb; border-radius: 14px; position: relative; overflow: hidden; }
            .break-after { page-break-after: always; }
            .frame { position: absolute; inset: 12px; border: 2px solid #0f766e20; border-radius: 12px; }
            .content { padding: 36px 40px; position: relative; z-index: 1; }
            .brand { display: flex; align-items: center; justify-content: space-between; color: #065f46; }
            .brand-left { display: flex; align-items: center; gap: 10px; }
            .brand-left img { height: 36px; width: auto; object-fit: contain; }
            .brand h2 { margin: 0; font-size: 18px; letter-spacing: 1px; text-transform: uppercase; }
            .brand-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
            .brand-right .issuer { font-weight: 700; color: #065f46; letter-spacing: .5px; }
            .brand-right .id { font-size: 12px; color: #6b7280; }
            .decor { height: 6px; background: linear-gradient(90deg, #10b981, #0ea5e9); border-radius: 999px; margin: 18px 0 32px; }
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
            .verify { margin-top: 16px; display: flex; gap: 14px; align-items: center; justify-content: center; color: #374151; }
            .verify small { display: block; color: #6b7280; }
            .qr { width: 108px; height: 108px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 6px; background: #fff; }
            .bottom-row { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
            .verify-right { display: flex; align-items: center; gap: 10px; text-align: right; justify-content: flex-end; }
            .footer { position: absolute; bottom: 24px; left: 0; right: 0; text-align: center; color: #9ca3af; font-size: 12px; }
            @media print {
              body { background: #fff; }
              .sheet { margin: 0; border: none; width: auto; min-height: auto; }
              .frame { border-color: #0f766e33; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="frame"></div>
            <div class="content">
              <div class="brand">
                <div class="brand-left">
                  <img src="${logoUrl}" alt="Logo UN‑IT"/>
                  <h2>${establishment}</h2>
                </div>
                <div class="brand-right">
                  <div class="issuer">E‑LEARN</div>
                  <div class="id">ID: ${certificateId}</div>
                </div>
              </div>
              <div class="decor"></div>
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
                  <div>
                    Vérifier l'authenticité<br/>
                    <small>${verifyUrl}</small><br/>
                    <small>Apprenant: ${learnerEmail}</small>
                  </div>
                  <img class="qr" src="${qrUrl}" alt="QR de vérification"/>
                </div>
              </div>

            </div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes certificats</h1>
        <p className="text-sm text-gray-500">Téléchargez un certificat officiel pour chaque formation complétée.</p>
      </div>

      {/* Démo rapide */}
      <div className="bg-white border rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Besoin d'un aperçu ? Générez un certificat de démonstration pour voir le rendu.
        </div>
        <button
          onClick={() => handleDownload({ id_form: 0, titre_form: 'Exemple de Formation', date: new Date().toISOString() })}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Voir un exemple de certificat
        </button>
      </div>

      {loading ? (
        <div className="bg-white border rounded-xl p-6">Chargement…</div>
      ) : completed.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 text-sm text-gray-600">
          Aucun certificat disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completed.map((c) => (
            <div key={c.id_form} className="bg-white border rounded-xl p-5">
              <div className="font-semibold">{c.titre_form}</div>
              <div className="text-xs text-gray-500">Terminé le {new Date(c.date).toLocaleDateString('fr-FR')}</div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleDownload(c)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Télécharger le certificat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



