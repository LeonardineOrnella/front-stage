'use client';

import React from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Contactez-nous</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Nous sommes là pour vous aider. N'hésitez pas à nous contacter 
            pour toute question ou demande d'information.
          </p>
        </div>
      </div>

      {/* Informations de contact */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Email</h3>
              <p className="text-gray-600 mb-2">contact@formation-excellence.com</p>
              <p className="text-gray-600">support@formation-excellence.com</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Téléphone</h3>
              <p className="text-gray-600 mb-2">+33 1 23 45 67 89</p>
              <p className="text-gray-600">+33 1 98 76 54 32</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Adresse</h3>
              <p className="text-gray-600 mb-2">123 Rue de l'Innovation</p>
              <p className="text-gray-600">75001 Paris, France</p>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Horaires d'ouverture</h2>
              <p className="text-gray-600">Nous sommes disponibles pour vous accompagner</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Lundi - Vendredi</h4>
                <p className="text-gray-600">9h00 - 18h00</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Samedi</h4>
                <p className="text-gray-600">10h00 - 16h00</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Support 24/7</h4>
                <p className="text-gray-600">En ligne</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Réponse Email</h4>
                <p className="text-gray-600">Sous 24h</p>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Envoyez-nous un message</h2>
              <p className="text-gray-600">Remplissez le formulaire ci-dessous et nous vous répondrons rapidement</p>
            </div>
            
            <form className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Votre prénom"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="formation">Demande d'information sur une formation</option>
                  <option value="inscription">Inscription à une formation</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Décrivez votre demande en détail..."
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-full text-lg hover:from-blue-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Envoyer le message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ rapide */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trouvez rapidement des réponses aux questions les plus courantes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Comment m'inscrire à une formation ?
              </h3>
              <p className="text-gray-600">
                Créez un compte sur notre plateforme, parcourez nos formations 
                et cliquez sur "S'inscrire" pour commencer votre apprentissage.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Les formations sont-elles certifiantes ?
              </h3>
              <p className="text-gray-600">
                Oui, toutes nos formations délivrent un certificat de réussite 
                reconnu par les professionnels du secteur.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Puis-je accéder aux formations hors ligne ?
              </h3>
              <p className="text-gray-600">
                Certaines formations peuvent être téléchargées pour un accès hors ligne, 
                selon le type de contenu et la formation choisie.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Comment contacter un formateur ?
              </h3>
              <p className="text-gray-600">
                Vous pouvez contacter les formateurs via notre plateforme 
                ou nous écrire directement pour toute question spécifique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
