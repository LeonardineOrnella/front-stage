"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/frontOffice/Header';
import Home from '@/components/frontOffice/acceuil/Home';
import AboutSection from '@/components/frontOffice/acceuil/AboutSection';
import CardFormation from '@/components/frontOffice/acceuil/CardFormation';
import ContactSection from '@/components/frontOffice/acceuil/ContactSection';
import Footer from '@/components/frontOffice/Footer';
import { formationService } from '@/service/formation.service';

export default function LandingPage() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const response = await formationService.getAllFormations();
      setFormations(response);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Home formations={formations} />
        <AboutSection />
        <CardFormation />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
