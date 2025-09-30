"use client";

import { useEffect, useState } from "react";
import { formationService } from "@/service/formation.service";

export default function Page() {
  const [reco, setReco] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await formationService.getAllFormations();
        setReco(Array.isArray(list) ? list.slice(0, 3) : []);
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble de votre activité.</p>
      </div>

      {/* CTA Parcourir le catalogue */}
      <div className="bg-white border rounded-xl p-6 flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold">Parcourir le catalogue des cours</h2>
          <p className="text-sm text-gray-600">Consultez les descriptions et aperçus, puis inscrivez-vous aux cours qui vous intéressent.</p>
        </div>
        <a href="/dasboard/apprenant/catalogue" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Voir le catalogue
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border">
          <p className="text-sm text-gray-500">Cours inscrits</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="p-4 rounded-xl bg-white border">
          <p className="text-sm text-gray-500">Quiz à venir</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="p-4 rounded-xl bg-white border">
          <p className="text-sm text-gray-500">Progression moyenne</p>
          <p className="text-2xl font-semibold">—%</p>
        </div>
        <div className="p-4 rounded-xl bg-white border">
          <p className="text-sm text-gray-500">Certificats obtenus</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
      </div>

      {/* Recommandés pour vous */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recommandés pour vous</h2>
          <a href="/dasboard/apprenant/catalogue" className="text-emerald-700 hover:underline text-sm">Tout voir</a>
        </div>
        {reco.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune recommandation disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reco.map((f) => (
              <div key={f.id_form} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-1 line-clamp-1">{f.titre_form}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{f.description}</p>
                <div className="flex items-center justify-between">
                  <a href={`/dasboard/apprenant/formation/${f.id_form}`} className="text-sm text-gray-700 hover:underline">Voir</a>
                  <a href={`/dasboard/apprenant/checkout/${f.id_form}`} className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700">S'inscrire</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border">
          <h2 className="font-semibold mb-2">Mes prochains cours</h2>
          <p className="text-sm text-gray-500">À implémenter</p>
        </div>
        <div className="p-4 rounded-xl bg-white border">
          <h2 className="font-semibold mb-2">Dernières notifications</h2>
          <p className="text-sm text-gray-500">À implémenter</p>
        </div>
      </div>
    </div>
  )
}


