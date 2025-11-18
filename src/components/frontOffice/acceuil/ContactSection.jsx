"use client";
import React from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
 

export default function ContactSection() {
  return (
    <div id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Contact</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Nous sommes à votre écoute</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Informations de contact */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Informations</h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                  <p className="text-gray-600">contact@formation-excellence.com</p>
                  <p className="text-gray-600">support@formation-excellence.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Téléphone</h4>
                  <p className="text-gray-600">+33 1 23 45 67 89</p>
                  <p className="text-gray-600">+33 1 98 76 54 32</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Adresse</h4>
                  <p className="text-gray-600">123 Rue de l'Innovation</p>
                  <p className="text-gray-600">75001 Paris, France</p>
                </div>
              </div>
            </div>

            {/* Horaires d'ouverture */}
            <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Horaires</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Lundi – Vendredi</span><span>9h00 - 18h00</span></div>
                <div className="flex justify-between"><span>Samedi</span><span>10h00 - 16h00</span></div>
                <div className="flex justify-between"><span>Support en ligne</span><span>Chat</span></div>
                <div className="flex justify-between"><span>Email</span><span>Réponse sous 24h</span></div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Formulaire de contact</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder={'Votre prénom'}
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder={'Votre nom'}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Sujet *</label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="formation">Formation</option>
                  <option value="inscription">Inscription</option>
                  <option value="support">Support</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                  placeholder={'Expliquez votre besoin...'}
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Send className="w-5 h-5" />
                Envoyer
              </button>
            </form>
          </div>
        </div>

        {/* FAQ rapide */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">FAQ</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Questions fréquentes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Comment m'inscrire à une formation ?</h4>
              <p className="text-gray-600">Créez un compte, parcourez nos formations et cliquez sur "S'inscrire".</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Les formations sont-elles certifiantes ?</h4>
              <p className="text-gray-600">Oui, un certificat est délivré à la réussite.</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Puis-je accéder hors ligne ?</h4>
              <p className="text-gray-600">Selon le contenu, certains modules sont téléchargeables.</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Comment contacter un formateur ?</h4>
              <p className="text-gray-600">Depuis la plateforme ou par email via la page contact.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
