"use client";

import { useEffect, useState } from "react";
import { userService } from "@/service/user.service";
import { toast } from "react-toastify";

export default function InscriptionsPage() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          toast.error("Veuillez vous connecter");
          return;
        }
        const user = JSON.parse(userStr);

        const res = await userService.getMesCours(user.id); // ton service backend GET inscriptions
        setInscriptions(res?.data || res || []);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        toast.error("Impossible de récupérer vos inscriptions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mes inscriptions</h1>

      {inscriptions.length === 0 ? (
        <p className="text-gray-600">Vous n’êtes inscrit à aucun cours pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inscriptions.map((ins, i) => (
            <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="font-semibold">{ins.titre_form || ins.formation?.titre_form}</h2>
              <p className="text-sm text-gray-600">{ins.description || ins.formation?.description}</p>
              <p className="text-xs text-gray-500 mt-2">Statut: {ins.statut || "Validée"}</p>
              <a
                href={`/dasboard/apprenant/formation/${ins.id_form || ins.formation_id}`}
                className="mt-3 inline-block px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
              >
                Accéder au cours
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
