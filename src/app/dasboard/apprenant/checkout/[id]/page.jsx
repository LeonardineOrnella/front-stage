"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { formationService } from "@/service/formation.service";
import { transactionService } from "@/service/transaction.service";
import { paymentService } from "@/service/payment.service";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const formatAriary = (val) => {
  const num = Number(val || 0);
  return `${num.toLocaleString('fr-MG')} Ar`;
};

const formatCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
};

function StripeCheckoutForm({ formationId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/paiement/success?formation=${formationId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Le paiement a échoué.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Paiement confirmé !");
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Traitement en cours…" : "Confirmer le paiement"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currency, setCurrency] = useState("eur");
  const [initializingPayment, setInitializingPayment] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        if (typeof window !== "undefined") {
          const cached = sessionStorage.getItem("checkoutFormation");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
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

        const config = await paymentService.getConfig().catch(() => null);
        if (config?.currency) setCurrency(config.currency);

        const data = await formationService.getFormationById(Number(id));
        const pick = (val) => (Array.isArray(val) ? val[0] : val);
        const src = pick(data?.formation || data?.data || data);
        const normalized = src
          ? {
          id_form: src.id_form ?? src.id ?? src.formation_id ?? src.ID,
          titre_form: src.titre_form ?? src.titre ?? src.title ?? "",
          description: src.description ?? src.resume ?? src.apercu ?? "",
              frais_form: Number(src.frais_form ?? src.prix ?? src.price ?? 0),
          duree_form: src.duree_form ?? src.duree ?? src.duration ?? null,
          image_couverture: src.image_couverture ?? src.cover ?? src.image ?? null,
          chapitres: src.chapitres ?? src.mchapitres ?? src.chapters ?? [],
            }
          : null;

        if (!normalized) {
          toast.error("Formation introuvable");
          router.replace("/dasboard/apprenant/catalogue");
          return;
        }

        const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (userStr) {
          try {
              const user = JSON.parse(userStr);
            const already = await transactionService.checkFormationAccess(normalized.id_form, user.id);
            if (already) {
                router.replace(`/dasboard/apprenant/formation/${normalized.id_form}`);
                return;
            }
          } catch {}
        }

        setFormation(normalized);
      } catch (error) {
        console.error("Erreur chargement formation:", error);
        toast.error("Impossible de charger la formation.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  const totalEuros = useMemo(() => {
    if (!formation) return 0;
    return Number(formation.frais_form || 0) / 4500;
  }, [formation]);

  const initializePayment = async () => {
    if (!formation) return;
    if (!stripePromise) {
      toast.error("Stripe n'est pas configuré côté client.");
      return;
    }

      const userStr = localStorage.getItem("user");
      if (!userStr) {
      toast.error("Veuillez vous connecter pour continuer.");
      router.push("/connexion");
        return;
      }

    try {
      const user = JSON.parse(userStr);
      const already = await transactionService.checkFormationAccess(formation.id_form, user.id);
        if (already) {
        toast.info("Vous avez déjà accès à cette formation.");
        router.push(`/dasboard/apprenant/formation/${formation.id_form}`);
          return;
        }

      setInitializingPayment(true);
      const response = await paymentService.createPaymentIntent(formation.id_form);
      if (!response?.success || !response?.clientSecret) {
        throw new Error(response?.message || "Erreur de création du paiement");
      }

      setClientSecret(response.clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Erreur init paiement:", error);
      toast.error(error?.response?.data?.message || error?.message || "Impossible de préparer le paiement.");
    } finally {
      setInitializingPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const unlocked = await transactionService.checkFormationAccessRobust(formation.id_form, user.id);
        if (unlocked) {
          router.push(`/dasboard/apprenant/formation/${formation.id_form}`);
          return;
        }
      } catch (error) {
        console.error("Erreur vérification accès formation:", error);
      }
    }

    toast.info("Paiement reçu. Votre accès sera disponible sous peu.");
    router.push("/dasboard/apprenant/transactions");
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

  if (!formation) {
    return null;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Confirmer l'inscription</h1>
      <p className="text-sm text-gray-500 mb-6">Vérifiez les détails avant de procéder au paiement sécurisé.</p>

      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div>
          {formation?.image_couverture && (
            <img
              src={`http://localhost:3001${formation.image_couverture}`}
              alt={formation.titre_form}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
          )}
          <h2 className="text-xl font-semibold">{formation.titre_form}</h2>
          <p className="text-gray-600">{formation.description || "Aperçu indisponible pour le moment."}</p>
          <div className="mt-3 text-sm text-gray-500">Durée estimée : {formation?.duree_form ?? "—"}h</div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Montant</span>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-600">{formatAriary(formation?.frais_form)}</div>
            <div className="text-xs text-gray-500">≈ {formatCurrency(totalEuros, currency)}</div>
          </div>
        </div>

        {Array.isArray(formation?.chapitres) && formation.chapitres.length > 0 && (
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-1">Chapitres inclus :</div>
            <ul className="list-disc ml-5 space-y-1">
              {formation.chapitres.slice(0, 3).map((c, i) => (
                <li key={i}>{c.titre_chap || c.titre || c.title || `Chapitre ${i + 1}`}</li>
              ))}
            </ul>
          </div>
        )}

        {!showPaymentForm && (
            <button
              type="button"
            onClick={initializePayment}
            disabled={initializingPayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initializingPayment ? "Préparation du paiement…" : "Procéder au paiement"}
            </button>
        )}

        {showPaymentForm && clientSecret && stripePromise && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <StripeCheckoutForm formationId={formation.id_form} onSuccess={handlePaymentSuccess} />
          </Elements>
        )}

        {!stripePromise && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            La clé publique Stripe n'est pas configurée. Ajoutez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans votre environnement.
          </div>
        )}
      </div>
    </div>
  );
}


