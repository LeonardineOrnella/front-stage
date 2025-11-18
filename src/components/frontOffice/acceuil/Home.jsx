"use client";
import React from 'react';
import { ArrowRight, Play, BookOpen, Users, Star } from 'lucide-react';
import FormationStats from './FormationStats';
 

export default function Home({ formations = [] }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section id="accueil" className="py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Apprenez et progressez avec
              <span className="text-emerald-600"> UN-IT</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Des formations pratiques pour accélérer votre carrière
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection('formations')}
                className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full text-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Parcourir les formations
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-full text-lg hover:bg-emerald-50 transition-all duration-300"
              >
                En savoir plus
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {formations.length}+
              </div>
              <div className="text-gray-600">formations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {formations.reduce((total, f) => total + (f.chapitres ? f.chapitres.length : 0), 0)}+
              </div>
              <div className="text-gray-600">chapitres</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {formations.reduce((total, f) => {
                  if (f.chapitres) {
                    return total + f.chapitres.reduce((chapTotal, chapitre) => {
                      return chapTotal + (chapitre.ressources ? chapitre.ressources.length : 0);
                    }, 0);
                  }
                  return total;
                }, 0)}+
              </div>
              <div className="text-gray-600">ressources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {formations.reduce((total, f) => total + (parseFloat(f.duree_form) || 0), 0)}+
              </div>
              <div className="text-gray-600">heures</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <FormationStats formations={formations} />

      {/* Section Caractéristiques */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Pourquoi choisir UN-IT</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Des contenus de qualité, accessibles et orientés pratique.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible</h3>
              <p className="text-gray-600">Apprenez à votre rythme, où que vous soyez.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Qualité</h3>
              <p className="text-gray-600">Des parcours conçus par des experts du domaine.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Communauté</h3>
              <p className="text-gray-600">Rejoignez une communauté active pour progresser ensemble.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
