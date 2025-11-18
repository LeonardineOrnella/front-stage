"use client";
import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Heart } from 'lucide-react';
import Link from 'next/link';
 

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">UN-IT</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">Plateforme de formation en ligne pour accélérer votre carrière.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Liens rapides</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => document.getElementById('accueil').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  À propos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('formations').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Formations
                </button>
              </li>
              <li>
                <Link href="/connexion" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Formations */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Formations</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Programmation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Développement web
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Data science
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Marketing digital
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Design
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Gestion de projet
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section contact */}
      <div className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Email</h5>
                <p className="text-gray-300">contact@unityfianar.site</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Téléphone</h5>
                <p className="text-gray-300">+261 34 93 036 49 </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Adresse</h5>
                <p className="text-gray-300">Lot 0303X/0012B Antamponjina Fianarantsoa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section newsletter */}
      <div className="border-t border-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h4 className="text-2xl font-bold text-white mb-4">Inscrivez-vous à la newsletter</h4>
            <p className="text-gray-300 mb-8">Recevez nos dernières actualités et formations.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={'Votre email'}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400"
            />
            <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105">
              S'abonner
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} UN-IT. Tous droits réservés.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Conditions</a>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Fait avec <Heart className="inline w-4 h-4 text-red-500" /> par l'équipe UN-IT
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
