"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formationService } from "@/service/formation.service";
import { toast } from "react-toastify";
import { userService } from "@/service/user.service";
import { CreditCard, Banknote, Smartphone } from "lucide-react";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card"); // card | bank | mobile
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [bank, setBank] = useState({ holder: "", bankName: "", account: "", ribKey: "" });
  const [mobile, setMobile] = useState({ operator: "", phone: "" });

  const formatAriary = (val) => {
    const num = Number(val || 0);
    return `${num.toLocaleString('fr-MG')} Ar`;
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        // Fallback immédiat depuis sessionStorage pour affichage statique
        if (typeof window !== 'undefined' && !formation) {
          const cached = sessionStorage.getItem('checkoutFormation');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              // eslint-disable-next-line no-console
              console.log('Checkout cached formation:', parsed);
              setFormation({
                id_form: parsed.id_form,
                titre_form: parsed.titre_form,
                description: parsed.description,
                frais_form: parsed.frais_form,
                duree_form: parsed.duree_form,
                image_couverture: parsed.image_couverture,
                chapitres: parsed.chapitres ?? parsed.mchapitres ?? [],
              });
            } catch {}
          }
        }
        const numericId = Number(id);
        // eslint-disable-next-line no-console
        console.log('Checkout load id:', numericId);
        const data = await formationService.getFormationById(numericId);
        const pick = (val) => Array.isArray(val) ? val[0] : val;
        const src = pick(data?.formation || data?.data || data);
        const normalized = src ? {
          id_form: src.id_form ?? src.id ?? src.formation_id ?? src.ID,
          titre_form: src.titre_form ?? src.titre ?? src.title ?? "",
          description: src.description ?? src.resume ?? src.apercu ?? "",
          frais_form: src.frais_form ?? src.prix ?? src.price ?? 0,
          duree_form: src.duree_form ?? src.duree ?? src.duration ?? null,
          image_couverture: src.image_couverture ?? src.cover ?? src.image ?? null,
          chapitres: src.chapitres ?? src.mchapitres ?? src.chapters ?? [],
        } : null;
        if (normalized) {
          setFormation(normalized);
          // Vérifier si déjà inscrit et rediriger directement
          try {
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            if (userStr) {
              const user = JSON.parse(userStr);
              const res = await userService.getMesCours(user.id);
              const courses = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
              const exists = courses.some((c) => Number(c.id_form ?? c.id) === Number(normalized.id_form));
              if (exists) {
                router.replace(`/dasboard/apprenant/formation/${normalized.id_form}`);
                return;
              }
            }
          } catch {}
        }
      } catch (e) {
        // Fallback: charger toutes les formations et chercher par id
        try {
          const all = await formationService.getAllFormations();
          const numericId = Number(id);
          const found = Array.isArray(all) ? all.find(f => Number(f.id_form ?? f.id) === numericId) : null;
          if (found) {
            setFormation({
              id_form: found.id_form ?? found.id,
              titre_form: found.titre_form ?? found.titre ?? "",
              description: found.description ?? "",
              frais_form: found.frais_form ?? found.prix ?? 0,
              duree_form: found.duree_form ?? found.duree ?? null,
              image_couverture: found.image_couverture ?? found.cover ?? null,
              chapitres: found.chapitres ?? found.mchapitres ?? [],
            });
          } else {
            toast.error("Formation introuvable");
          }
        } catch {
          toast.error("Formation introuvable");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePayerEtInscrire = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Veuillez vous connecter");
        router.push("/connexion");
        return;
      }
      const user = JSON.parse(userStr);
      // Validation minimale selon la méthode
      if (paymentMethod === 'card') {
        if (!card.number || !card.name || !card.expiry || !card.cvc) {
          toast.error("Veuillez renseigner les informations de carte");
          return;
        }
      } else if (paymentMethod === 'bank') {
        if (!bank.holder || !bank.bankName || !bank.account || !bank.ribKey) {
          toast.error("Veuillez renseigner les informations bancaires (Titulaire, Banque, Compte, Clé RIB)");
          return;
        }
      } else if (paymentMethod === 'mobile') {
        if (!mobile.operator || !mobile.phone) {
          toast.error("Veuillez renseigner les informations mobile money");
          return;
        }
      }

      toast.success("Paiement accepté. Inscription en cours...");
       await userService.inscrireFormation({ 
         userId: user.id, 
         formationId: id,
         payment: {
           method: paymentMethod,
           card: paymentMethod==='card' ? card : undefined,
           bank: paymentMethod==='bank' ? bank : undefined,
           mobile: paymentMethod==='mobile' ? mobile : undefined,
           currency: 'MGA'
         }
       });
      toast.success("Inscription enregistrée");
      router.push(`/dasboard/apprenant/formation/${id}`);
    } catch (e) {
      toast.error("Échec du paiement/inscription");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="h-5 w-52 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-emerald-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Confirmer l'inscription</h1>
      <p className="text-sm text-gray-500 mb-6">Vérifiez les détails avant le paiement.</p>

      {!formation && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-4 text-sm">
          Impossible d'afficher la formation. Essayez de revenir au catalogue et de cliquer à nouveau sur "S'inscrire".
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div>
          {formation?.image_couverture && (
            <img src={`http://localhost:3001${formation.image_couverture}`} alt={formation.titre_form} className="w-full h-40 object-cover rounded-lg mb-4" />
          )}
          <h2 className="text-xl font-semibold">{formation?.titre_form || `Formation #${id}`}</h2>
          <p className="text-gray-600">{formation?.description || "Aperçu indisponible pour le moment."}</p>
          <div className="mt-3 text-sm text-gray-500">Durée estimée: {formation?.duree_form ?? '—'}h</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Montant</span>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-600">{formatAriary(formation?.frais_form)}</div>
            <div className="text-xs text-gray-500">~ {(parseFloat(formation?.frais_form || 0) / 4500).toFixed(2)} € (indicatif)</div>
          </div>
        </div>
        {Array.isArray(formation?.chapitres) && formation.chapitres.length > 0 && (
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-1">Chapitres inclus:</div>
            <ul className="list-disc ml-5 space-y-1">
              {formation.chapitres.slice(0,3).map((c, i) => (
                <li key={i}>{c.titre_chap || c.titre || c.title || `Chapitre ${i+1}`}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Méthode de paiement */}
        <div>
          <div className="font-semibold mb-3">Méthode de paiement</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 border rounded-lg text-left flex items-center gap-3 ${paymentMethod==='card' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Carte bancaire</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 border rounded-lg text-left flex items-center gap-3 ${paymentMethod==='bank' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span>Virement bancaire</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('mobile')}
              className={`p-4 border rounded-lg text-left flex items-center gap-3 ${paymentMethod==='mobile' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>Mobile money</span>
            </button>
          </div>
        </div>

        {/* Formulaires conditionnels */}
        {paymentMethod === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Numéro de carte</label>
              <input value={card.number} onChange={(e)=>setCard({...card, number:e.target.value})} placeholder="4111 1111 1111 1111" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Nom sur la carte</label>
              <input value={card.name} onChange={(e)=>setCard({...card, name:e.target.value})} placeholder="NOM PRÉNOM" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Expiration</label>
              <input value={card.expiry} onChange={(e)=>setCard({...card, expiry:e.target.value})} placeholder="MM/AA" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-sm text-gray-600">CVC</label>
              <input value={card.cvc} onChange={(e)=>setCard({...card, cvc:e.target.value})} placeholder="123" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Titulaire du compte</label>
              <input value={bank.holder} onChange={(e)=>setBank({...bank, holder:e.target.value})} placeholder="Nom du titulaire" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Banque</label>
              <input value={bank.bankName} onChange={(e)=>setBank({...bank, bankName:e.target.value})} placeholder="BOA / BNI / Accès / ..." className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Numéro de compte</label>
              <input value={bank.account} onChange={(e)=>setBank({...bank, account:e.target.value})} placeholder="XXXXXXXXXXXX" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Clé RIB</label>
              <input value={bank.ribKey} onChange={(e)=>setBank({...bank, ribKey:e.target.value})} placeholder="XX" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
        )}

        {paymentMethod === 'mobile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Opérateur</label>
              <select value={mobile.operator} onChange={(e)=>setMobile({...mobile, operator:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                <option value="">Sélectionner</option>
                <option value="orange">Orange Money (MG)</option>
                <option value="airtel">Airtel Money (MG)</option>
                <option value="telma">Mvola (Telma)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Numéro de téléphone</label>
              <input value={mobile.phone} onChange={(e)=>setMobile({...mobile, phone:e.target.value})} placeholder="Ex: 032 / 033 / 034 ..." className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
        )}

        <button onClick={handlePayerEtInscrire} disabled={!formation} className={`w-full text-white rounded-lg py-3 ${formation ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`}>
          Payer et s'inscrire
        </button>
      </div>
    </div>
  );
}


