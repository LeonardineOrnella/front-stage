"use client";
import React from 'react';
import { Users, BookOpen, Award, Target, CheckCircle, Lightbulb } from 'lucide-react';

export default function AboutSection() {
  return (
    <div id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">À propos de nous</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous sommes passionnés par l'éducation et l'apprentissage en ligne. 
            Notre mission est de rendre la formation accessible à tous.
          </p>
        </div>

        {/* Mission et Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Transformer l'éducation en ligne en créant des expériences d'apprentissage 
              engageantes et efficaces. Nous croyons que chacun mérite d'accéder à 
              une formation de qualité, peu importe où il se trouve.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Notre plateforme connecte les apprenants aux meilleurs formateurs 
              et offre un contenu pédagogique innovant et adaptatif.
            </p>
          </div>
          <div className="relative">
            <div className="bg-emerald-600 rounded-2xl p-8 text-white">
              <Target className="w-16 h-16 mb-4" />
              <h4 className="text-2xl font-bold mb-4">Notre Vision</h4>
              <p className="text-lg">
                Devenir la référence en matière de formation en ligne, 
                en combinant technologie avancée et expertise pédagogique 
                pour créer un avenir où l'apprentissage n'a plus de limites.
              </p>
            </div>
          </div>
        </div>

        {/* Valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Qualité</h4>
            <p className="text-gray-600">
              Nous maintenons les plus hauts standards de qualité 
              dans tous nos contenus et services.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Communauté</h4>
            <p className="text-gray-600">
              Nous favorisons l'échange et la collaboration 
              entre apprenants et formateurs.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h4>
            <p className="text-gray-600">
              Nous explorons constamment de nouvelles méthodes 
              d'apprentissage et technologies.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Accessibilité</h4>
            <p className="text-gray-600">
              Nous rendons l'éducation accessible à tous, 
              peu importe les barrières géographiques ou économiques.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h4>
            <p className="text-gray-600">
              Nous visons l'excellence dans tous nos programmes 
              et accompagnements pédagogiques.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Impact</h4>
            <p className="text-gray-600">
              Nous mesurons notre succès par l'impact positif 
              sur la carrière et le développement de nos apprenants.
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-20 bg-emerald-600 rounded-2xl p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Nos Chiffres Clés</h3>
            <p className="text-xl opacity-90">
              Une croissance constante et des résultats probants
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">5+</div>
              <div className="text-lg opacity-90">Années d'expérience</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Formations disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Apprenants formés</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-90">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
