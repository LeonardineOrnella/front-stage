"use client";
import React from 'react';
import { BookOpen, Clock, FileText } from 'lucide-react';

export default function FormationDemo() {
  // Données de démonstration basées sur votre API
  const demoFormations = [
    {
      id_form: 1,
      titre_form: "Occaecat ea nihil au",
      description: "Quia ipsa tempor ei",
      statut_form: "Inactive",
      duree_form: "85",
      frais_form: "54.29",
      image_couverture: "/uploads/couvertures/1756532886645-394086774.jpeg",
      id_categ: 7,
      categorie: "Développement Web",
      chapitres: [
        {
          id_chap: 1,
          titre_chap: "Chapitre 1",
          duree: "5h",
          ordre: 1,
          type: "Publié",
          ressources: []
        },
        {
          id_chap: 11,
          titre_chap: "Introtuction",
          duree: "2h",
          ordre: 1,
          type: "Publié",
          ressources: [
            {
              id_res: 1,
              type: "pdf",
              url: "/uploads/ressources/1756532886656-916556602.pdf",
              nom_fichier: "CV_RANDRIANASOLO Jean Marc Thonny.pdf",
              taille_fichier: 154609,
              created_at: "2025-08-30T05:48:06.000Z"
            }
          ]
        }
      ]
    },
    {
      id_form: 2,
      titre_form: "Formations python",
      description: "zazazaza",
      statut_form: "Active",
      duree_form: "32",
      frais_form: "20.00",
      image_couverture: "/uploads/couvertures/1756534215643-491669063.jpeg",
      id_categ: 8,
      categorie: "Développement Web",
      chapitres: [
        {
          id_chap: 3,
          titre_chap: "Chapitre 1",
          duree: "5h",
          ordre: 1,
          type: "Publié",
          ressources: []
        },
        {
          id_chap: 13,
          titre_chap: "test",
          duree: "2h",
          ordre: 1,
          type: "Publié",
          ressources: [
            {
              id_res: 3,
              type: "pdf",
              url: "/uploads/ressources/1756534215649-32903900.pdf",
              nom_fichier: "offre_service_25-08-0000074.pdf",
              taille_fichier: 1362908,
              created_at: "2025-08-30T06:10:15.000Z"
            }
          ]
        }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Démonstration des Formations
          </h2>
          <p className="text-xl text-gray-600">
            Affichage des vraies données de la base de données
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoFormations.map((formation) => {
            const chapitres_count = formation.chapitres ? formation.chapitres.length : 0;
            const ressources_count = formation.chapitres ? 
              formation.chapitres.reduce((total, chapitre) => {
                return total + (chapitre.ressources ? chapitre.ressources.length : 0);
              }, 0) : 0;

            return (
              <div key={formation.id_form} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Image de couverture */}
                <div className="relative h-48 overflow-hidden">
                  <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formation.statut_form)}`}>
                      {formation.statut_form}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                      {formation.categorie}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {formation.titre_form}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {formation.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formation.duree_form}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{chapitres_count} chapitres</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{ressources_count} ressources</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-emerald-600">
                      {formatPrice(formation.frais_form)}€
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300">
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-emerald-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Données récupérées avec succès !
            </h3>
            <p className="text-lg opacity-90">
              Les formations sont maintenant dynamiques et récupérées depuis la base de données
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
