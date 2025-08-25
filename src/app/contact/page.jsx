'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  BookOpen,
  Users,
  Star,
  Globe,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    typeMessage: 'information',
    sujet: '',
    message: '',
    newsletter: false
  });
  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Téléphone",
      content: "+33 1 23 45 67 89",
      subtitle: "Lun-Ven 9h-18h",
      href: "tel:+33123456789"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      content: "contact@elearning-pro.fr",
      subtitle: "Réponse sous 24h",
      href: "mailto:contact@elearning-pro.fr"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Adresse",
      content: "123 Avenue de l'Innovation",
      subtitle: "75001 Paris, France",
      href: "https://maps.google.com"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Horaires",
      content: "9h00 - 18h00",
      subtitle: "Du lundi au vendredi"
    }
  ];

  const stats = [
    { icon: <Globe className="w-8 h-8" />, number: "10,000+", label: "Apprenants formés" },
    { icon: <BookOpen className="w-8 h-8" />, number: "500+", label: "Formations disponibles" },
    { icon: <Users className="w-8 h-8" />, number: "24/7", label: "Support client" },
    { icon: <Star className="w-8 h-8" />, number: "4.9/5", label: "Satisfaction client" }
  ];

  // Page de confirmation
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}


      {/* Stats Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:bg-blue-200 transition-colors">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">


          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Nos coordonnées</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="group">
                    {info.href ? (
                      <a href={info.href} className="flex items-start space-x-5 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                          <p className="text-gray-900 mb-1">{info.content}</p>
                          <p className="text-sm text-gray-500">{info.subtitle}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start space-x-5 p-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                          <p className="text-gray-900 mb-1">{info.content}</p>
                          <p className="text-sm text-gray-500">{info.subtitle}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className=" bg-gradient-to-br from-blue-800 via-emerald-600 to-emerald-700 rounded-3xl shadow-2xl p-8 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16">
              </div>
              <div className="relative">
                <h3 className="text-2xl font-bold mb-6">Besoin d'une réponse rapide ?</h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Nos experts sont disponibles pour un échange téléphonique immédiat.
                </p>
                <a
                  href="tel:+33123456789"
                  className="inline-flex items-center bg-white text-blue-700 font-semibold py-4 px-6 rounded-xl hover:bg-blue-50 transition-colors space-x-3"
                >
                  <Phone className="w-5 h-5" />
                  <span>Appelez maintenant</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
