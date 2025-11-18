"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { transactionService, TRANSACTION_STATUS, STATUS_LABELS, STATUS_COLORS, PAYMENT_METHOD_LABELS } from "@/service/transaction.service";
import RequireRole from "@/components/backoOffice/RequireRole";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAllTransactions();
      const data = res?.data?.data || res?.data || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Impossible de charger les transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter(t => t.statut_trans === filter);
  }, [transactions, filter]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await transactionService.updateTransactionStatus(id, status);
      toast.success("Statut mis à jour");
      await load();
    } catch (e) {
      toast.error("Échec de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <RequireRole roles={["admin","formateur"]}>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="border rounded-lg px-3 py-2 bg-white">
            <option value="all">Tous les statuts</option>
            <option value={TRANSACTION_STATUS.EN_ATTENTE}>{STATUS_LABELS[TRANSACTION_STATUS.EN_ATTENTE]}</option>
            <option value={TRANSACTION_STATUS.VALIDEE}>{STATUS_LABELS[TRANSACTION_STATUS.VALIDEE]}</option>
            <option value={TRANSACTION_STATUS.ECHOUEE}>{STATUS_LABELS[TRANSACTION_STATUS.ECHOUEE]}</option>
            <option value={TRANSACTION_STATUS.ANNULEE}>{STATUS_LABELS[TRANSACTION_STATUS.ANNULEE]}</option>
          </select>
          <button onClick={load} className="px-3 py-2 border rounded-lg">Rafraîchir</button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">Aucune transaction</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 gap-3 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600">
            <div>Référence</div>
            <div>Utilisateur</div>
            <div>Formation</div>
            <div>Montant</div>
            <div>Statut</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {filtered.map((t) => (
              <div key={t.id_trans || t.id} className="grid grid-cols-6 gap-3 px-4 py-3 items-center text-sm">
                <div className="font-mono text-xs">{t.reference || '—'}</div>
                <div>{t.nom ? `${t.prenom || ''} ${t.nom}`.trim() : (t.id || '—')}</div>
                <div>{t.titre_form || t.id_form || '—'}</div>
                <div className="font-semibold text-emerald-700">{Number(t.montant || 0).toLocaleString('fr-MG')} Ar</div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[t.statut_trans] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[t.statut_trans] || t.statut_trans}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{PAYMENT_METHOD_LABELS?.[t.methode_paiement] || t.methode_paiement}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={updatingId=== (t.id_trans || t.id)}
                    onClick={() => updateStatus(t.id_trans || t.id, TRANSACTION_STATUS.VALIDEE)}
                    className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Valider
                  </button>
                  <button
                    disabled={updatingId=== (t.id_trans || t.id)}
                    onClick={() => updateStatus(t.id_trans || t.id, TRANSACTION_STATUS.ECHOUEE)}
                    className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </RequireRole>
  );
}




