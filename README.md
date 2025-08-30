# E-Learn Platform - Frontend

## Description

Plateforme d'apprentissage en ligne avec système d'authentification et gestion complète des formations.

## Fonctionnalités

### 🔐 Authentification
- **Connexion obligatoire** pour accéder au dashboard
- **Middleware de protection** des routes du dashboard
- **Redirection automatique** vers la page de connexion si non authentifié
- **Gestion des tokens** (localStorage + cookies)
- **Déconnexion sécurisée**

### 📚 Gestion des Formations (CRUD)
- **Création** de formations avec chapitres et ressources
- **Lecture** de la liste des formations
- **Mise à jour** des formations existantes
- **Suppression** des formations
- **Gestion des fichiers** (PDF, vidéos)
- **Structure hiérarchique** : Formation → Chapitres → Ressources

### 🎯 Structure des Données
```json
{
  "titre_form": "Test Formation",
  "description": "Description test",
  "statut_form": "Active",
  "duree_form": 20,
  "frais_form": 99.99,
  "date_form": "2025-01-15",
  "id_categ": 2,
  "chapitres": [
    {
      "titre_chap": "Chapitre 1",
      "ordre": 1,
      "type": "Publié",
      "duree": "5h",
      "id_categ": 2,
      "ressources": [
        {
          "type": "pdf",
          "fileIndex": 0
        }
      ]
    }
  ]
}
```

## Architecture

### Composants de Sécurité
- `AuthGuard` : Vérifie l'authentification avant d'afficher le contenu
- `ErrorBoundary` : Capture et gère les erreurs de l'application
- `middleware.js` : Protection des routes côté serveur

### Services
- `formation.service.js` : API calls pour les formations
- `user.service.js` : Gestion de l'authentification

### Composants UI
- `Notification` : Affichage des messages de succès/erreur
- `NotificationManager` : Gestion centralisée des notifications
- `NavBar` & `SideBar` : Navigation du dashboard

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Utilisation

### 1. Connexion
- Accédez à `/connexion`
- Entrez vos identifiants
- Redirection automatique vers `/dasboard`

### 2. Dashboard
- **Route protégée** : `/dasboard/*`
- **Accès** : Authentification obligatoire
- **Fonctionnalités** :
  - Gestion des formations
  - Gestion des catégories
  - Gestion des formateurs
  - Gestion des chapitres

### 3. Gestion des Formations
- **Créer** : Bouton "Nouvelle Formation"
- **Modifier** : Clic sur "Modifier" dans la liste
- **Supprimer** : Clic sur "Supprimer" avec confirmation
- **Fichiers** : Upload multiple (PDF, vidéos)
- **Chapitres** : Ajout/suppression dynamique
- **Ressources** : Gestion par chapitre

## Sécurité

### Protection des Routes
- **Middleware** : Vérification côté serveur
- **AuthGuard** : Vérification côté client
- **Tokens** : Stockage sécurisé (localStorage + cookies)

### Gestion des Erreurs
- **ErrorBoundary** : Capture des erreurs React
- **Notifications** : Feedback utilisateur en temps réel
- **Fallbacks** : UI de secours en cas d'erreur

## API Endpoints

### Formations
- `GET /formations` - Liste des formations
- `GET /formations/:id` - Détails d'une formation
- `POST /formations` - Créer une formation
- `PUT /formations/:id` - Mettre à jour une formation
- `DELETE /formations/:id` - Supprimer une formation

### Catégories
- `GET /categories` - Liste des catégories

### Authentification
- `POST /auth/login` - Connexion utilisateur

## Structure des Fichiers

```
src/
├── app/
│   ├── connexion/          # Page de connexion
│   ├── dasboard/          # Dashboard protégé
│   │   ├── formation/     # CRUD des formations
│   │   ├── categorie/     # Gestion des catégories
│   │   ├── formateur/     # Gestion des formateurs
│   │   └── chapitre/      # Gestion des chapitres
│   └── layout.js          # Layout principal
├── components/
│   └── backoOffice/       # Composants du dashboard
│       ├── AuthGuard.jsx  # Protection d'authentification
│       ├── ErrorBoundary.jsx # Gestion des erreurs
│       ├── Notification.jsx   # Composant de notification
│       ├── NavBar.jsx     # Barre de navigation
│       └── SideBar.jsx    # Barre latérale
├── hooks/
│   └── useNotification.js # Hook pour les notifications
├── service/
│   ├── formation.service.js # Service des formations
│   └── user.service.js     # Service d'authentification
└── middleware.js           # Protection des routes
```

## Développement

### Ajouter une Nouvelle Route Protégée
1. Créer le composant dans `src/app/dasboard/`
2. La route sera automatiquement protégée par le middleware
3. Utiliser `useNotification()` pour les messages utilisateur

### Ajouter un Nouveau Service
1. Créer le fichier dans `src/service/`
2. Importer et utiliser dans les composants
3. Gérer les erreurs avec try/catch

## Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur
2. Consultez les logs du serveur
3. Utilisez l'ErrorBoundary pour le débogage

## Licence

MIT License
