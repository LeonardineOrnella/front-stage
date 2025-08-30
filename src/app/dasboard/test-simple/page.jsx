'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Home, Users, GraduationCap } from 'lucide-react';

export default function TestSimplePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          console.error('Erreur parsing user:', e);
        }
      }
      setLoading(false);
    }
  }, []);

  const goToPage = (path) => {
    console.log('Navigation vers:', path);
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Test de Navigation Simple</h1>
          </div>

          {/* Informations utilisateur */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-emerald-900 mb-4">Utilisateur Connecté</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ID:</span> {user?.id || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Nom:</span> {user?.nom || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Prénom:</span> {user?.prenom || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Rôle:</span> {user?.role || 'N/A'}
              </div>
            </div>
          </div>

          {/* Test de navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Principale</h3>
              <div className="space-y-3">
                <button
                  onClick={() => goToPage('/dasboard')}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Dashboard Principal
                </button>
                
                <button
                  onClick={() => goToPage('/dasboard/formation')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  Formations
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Admin</h3>
              <div className="space-y-3">
                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => goToPage('/dasboard/utilisateurs')}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Gestion Utilisateurs
                    </button>
                    
                    <button
                      onClick={() => goToPage('/dasboard/formateur')}
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Gestion Formateurs
                    </button>
                  </>
                )}
                
                {user?.role !== 'admin' && (
                  <p className="text-gray-500 text-sm">Réservé aux administrateurs</p>
                )}
              </div>
            </div>
          </div>

          {/* Debug localStorage */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug localStorage</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">User:</span> {localStorage.getItem('user') || 'Vide'}
              </div>
              <div>
                <span className="font-medium">Token:</span> {localStorage.getItem('token') || 'Vide'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
