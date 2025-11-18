import React from 'react';
import { Users, BookOpen, Award, Target, CheckCircle, Lightbulb } from 'lucide-react';
 

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">À propos</h1>
          <p className="text-xl max-w-3xl mx-auto">Notre mission et nos valeurs</p>
        </div>
      </div>

      {/* Mission et Vision */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">Proposer des formations accessibles et pratiques pour accélérer les carrières.</p>
              <p className="text-lg text-gray-600 leading-relaxed">Nous mettons l'accent sur la qualité, l'impact et la progression continue.</p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl p-8 text-white">
                <Target className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Notre vision</h3>
                <p className="text-lg">Devenir la référence pour l'apprentissage pratique et certifiant.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valeurs */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Nos valeurs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Ce qui guide chacune de nos décisions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Qualité</h3>
              <p className="text-gray-600">Des contenus rigoureux, revus par des experts.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Communauté</h3>
              <p className="text-gray-600">Apprendre ensemble pour aller plus loin.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">Expérimenter de nouveaux formats d'apprentissage.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessibilité</h3>
              <p className="text-gray-600">Des parcours clairs et accessibles à tous.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">Des objectifs ambitieux, des résultats mesurables.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Impact</h3>
              <p className="text-gray-600">Créer de la valeur concrète pour les apprenants.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Nos chiffres</h2>
            <p className="text-xl opacity-90">Une communauté en croissance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">5+</div>
              <div className="text-lg opacity-90">années d'expérience</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">formations disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">apprenants</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-90">satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
