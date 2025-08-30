'use client';

import { useState, useEffect } from 'react';
import { Shield, GraduationCap, BookOpen, User, LogOut } from 'lucide-react';

export default function TestRolesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingUser = localStorage.getItem('user');
      if (existingUser) {
        try {
          const userData = JSON.parse(existingUser);
          setUser(userData);
        } catch (e) {
          console.error('Erreur parsing user data:', e);
        }
      }
      setLoading(false);
    }
  }, []);

  const changeRole = (newRole) => {
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Test du Système de Rôles</h1>
          
          {/* Informations utilisateur */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-emerald-900 mb-4">Utilisateur Connecté</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-800">
                  {user?.nom?.charAt(0)?.toUpperCase() || user?.prenom?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : user?.nom || user?.prenom || 'Utilisateur'}
                </p>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user?.role === 'admin' && <Shield className="w-5 h-5 text-red-500" />}
                  {user?.role === 'formateur' && <GraduationCap className="w-5 h-5 text-blue-500" />}
                  {user?.role === 'apprenant' && <BookOpen className="w-5 h-5 text-green-500" />}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user?.role === 'formateur' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role === 'admin' ? 'Administrateur' :
                     user?.role === 'formateur' ? 'Formateur' :
                     user?.role === 'apprenant' ? 'Apprenant' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test des rôles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer de Rôle</h3>
              <div className="space-y-3">
                <button
                  onClick={() => changeRole('admin')}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    user?.role === 'admin'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Administrateur
                  </div>
                </button>
                
                <button
                  onClick={() => changeRole('formateur')}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    user?.role === 'formateur'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Formateur
                  </div>
                </button>
                
                <button
                  onClick={() => changeRole('apprenant')}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    user?.role === 'apprenant'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Apprenant
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    user?.role === 'admin' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Gestion des utilisateurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    user?.role === 'admin' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Gestion des formateurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    ['admin', 'formateur'].includes(user?.role) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Créer des formations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    ['admin', 'formateur'].includes(user?.role) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Modifier des formations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    user?.role === 'admin' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Supprimer des formations</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/dasboard'}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Aller au Dashboard
                </button>
                
                <button
                  onClick={() => window.location.href = '/dasboard/formation'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir les Formations
                </button>
                
                {user?.role === 'admin' && (
                  <button
                    onClick={() => window.location.href = '/dasboard/utilisateurs'}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Gérer les Utilisateurs
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions de Test</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Changez de rôle en cliquant sur les boutons ci-dessus</li>
              <li>Retournez au dashboard pour voir la sidebar s'adapter</li>
              <li>Testez l'accès aux différentes pages selon le rôle</li>
              <li>Vérifiez que les permissions sont respectées</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
