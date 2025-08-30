"use client";
import React from 'react';
import { BookOpen, Clock, FileText, Users } from 'lucide-react';

export default function FormationStats({ formations }) {
  // Calculer les statistiques
  const totalFormations = formations.length;
  const totalChapitres = formations.reduce((total, formation) => {
    return total + (formation.chapitres ? formation.chapitres.length : 0);
  }, 0);
  
  const totalRessources = formations.reduce((total, formation) => {
    if (formation.chapitres) {
      return total + formation.chapitres.reduce((chapTotal, chapitre) => {
        return chapTotal + (chapitre.ressources ? chapitre.ressources.length : 0);
      }, 0);
    }
    return total;
  }, 0);

  const totalDuree = formations.reduce((total, formation) => {
    return total + (parseFloat(formation.duree_form) || 0);
  }, 0);

  const stats = [
    {
      icon: <BookOpen className="w-8 h-8 text-emerald-600" />,
      label: "Formations",
      value: totalFormations,
      description: "disponibles"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      label: "Heures",
      value: totalDuree,
      description: "de contenu"
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      label: "Chapitres",
      value: totalChapitres,
      description: "à explorer"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      label: "Ressources",
      value: totalRessources,
      description: "à télécharger"
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nos formations en chiffres
          </h2>
          <p className="text-xl text-gray-600">
            Découvrez l'ampleur de notre catalogue de formations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-emerald-100 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Call-to-action supplémentaire */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
            <span className="text-lg font-medium">Voir toutes nos formations</span>
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
