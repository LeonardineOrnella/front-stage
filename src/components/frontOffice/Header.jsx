"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Users, Mail, Home } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-100' 
        : 'bg-emerald-600'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isScrolled ? 'bg-emerald-600' : 'bg-white'
            }`}>
              <BookOpen className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-emerald-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${
              isScrolled ? 'text-emerald-600' : 'text-white'
            }`}>
              Formation Excellence
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('accueil')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-700 ${
                isScrolled 
                  ? 'text-emerald-600 hover:bg-emerald-50' 
                  : 'text-white hover:bg-emerald-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            
            <button
              onClick={() => scrollToSection('about')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-700 ${
                isScrolled 
                  ? 'text-emerald-600 hover:bg-emerald-50' 
                  : 'text-white hover:bg-emerald-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>À propos</span>
            </button>
            
            <button
              onClick={() => scrollToSection('formations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-700 ${
                isScrolled 
                  ? 'text-emerald-600 hover:bg-emerald-50' 
                  : 'text-white hover:bg-emerald-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Formations</span>
            </button>
            
            <button
              onClick={() => scrollToSection('contact')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-700 ${
                isScrolled 
                  ? 'text-emerald-600 hover:bg-emerald-50' 
                  : 'text-white hover:bg-emerald-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>
          </nav>

          {/* Boutons d'action */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="/connexion" 
              className={`px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
                  : 'border-white text-white hover:bg-white hover:text-emerald-600'
              }`}
            >
              Connexion
            </Link>
            <Link 
              href="/inscription" 
              className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-white text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Inscription
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled 
                ? 'text-emerald-600 hover:bg-emerald-50' 
                : 'text-white hover:bg-emerald-700'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-emerald-200">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => scrollToSection('accueil')}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </button>
              
              <button
                onClick={() => scrollToSection('about')}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>À propos</span>
              </button>
              
              <button
                onClick={() => scrollToSection('formations')}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Formations</span>
              </button>
              
              <button
                onClick={() => scrollToSection('contact')}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </button>
              
              <div className="pt-4 border-t border-emerald-200 space-y-2">
                <Link 
                  href="/connexion" 
                  className="block px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  href="/inscription" 
                  className="block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

