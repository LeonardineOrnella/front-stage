'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Vérifier le token dans localStorage
        const token = localStorage.getItem('token');
        
        // Vérifier le token dans les cookies
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        const cookieToken = tokenCookie ? tokenCookie.split('=')[1] : null;
        
        if (!token && !cookieToken) {
          // Pas de token trouvé, rediriger vers la connexion
          router.push('/connexion');
          return;
        }

        // Vérifier si l'utilisateur existe
        const user = localStorage.getItem('user');
        if (!user) {
          // Pas d'utilisateur trouvé, rediriger vers la connexion
          localStorage.removeItem('token');
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax";
          router.push('/connexion');
          return;
        }

        // Vérifier la validité du token (optionnel - vous pouvez ajouter une vérification côté serveur)
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // En cas d'erreur, rediriger vers la connexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax";
        router.push('/connexion');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si authentifié, afficher le contenu
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Si non authentifié, ne rien afficher (la redirection est en cours)
  return null;
}

