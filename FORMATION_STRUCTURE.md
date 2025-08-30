# Structure des Formations - Documentation

## 🎯 Vue d'ensemble

Le système de gestion des formations a été restructuré pour offrir une meilleure expérience utilisateur et une gestion plus claire des ressources. Chaque formation peut contenir des chapitres, et chaque chapitre peut avoir plusieurs ressources de types différents (PDF ou vidéo).

## 📁 Structure des Fichiers

```
src/app/dasboard/formation/
├── page.jsx                    # Page principale (liste + filtres)
├── create/
│   └── page.jsx               # Page de création
└── edit/
    └── [id]/
        └── page.jsx            # Page d'édition
```

## 🔧 Types de Ressources

### **Ressources de Chapitre**
- **Type** : `pdf` ou `video`
- **Fichier** : Index dans la liste des fichiers uploadés
- **Gestion** : Le backend gère automatiquement l'URL et le stockage

### **Types de Fichiers Supportés**
- **PDF** : Documents et supports de cours
- **Vidéos** : MP4, AVI, MOV, MKV
- **Taille maximale** : 100MB par fichier

## 📊 Structure des Données

### Formation
```json
{
  "titre_form": "Formation React Avancé",
  "description": "Maîtrisez React avec hooks et contexte",
  "statut_form": "Active",
  "duree_form": 40,
  "frais_form": 299.99,
  "date_form": "2025-01-15",
  "id_categ": 2,
  "chapitres": [...]
}
```

### Chapitre
```json
{
  "titre_chap": "Introduction à React",
  "ordre": 1,
  "type": "Publié",
  "duree": "2h30",
  "id_categ": 2,
  "ressources": [...]
}
```

### Ressource
```json
{
  "type": "pdf",        // 'pdf' ou 'video'
  "fileIndex": 0        // Index du fichier dans la liste
}
```

## 🚀 Flux de Création

### 1. **Upload des Fichiers**
- L'utilisateur sélectionne des fichiers (PDF, vidéos)
- Les fichiers sont stockés temporairement dans l'état local
- Chaque fichier reçoit un index séquentiel

### 2. **Création des Chapitres**
- L'utilisateur ajoute des chapitres avec titre, ordre, durée
- Chaque chapitre peut avoir plusieurs ressources

### 3. **Ajout des Ressources**
- **Type** : Sélection entre PDF ou Vidéo
- **Fichier** : Sélection de l'index du fichier uploadé
- **Validation** : Type et fichier obligatoires

### 4. **Envoi à l'API**
- Les données de formation sont envoyées en JSON
- Les fichiers sont envoyés en multipart/form-data
- Le `fileIndex` permet de faire correspondre les ressources aux fichiers
- Le backend gère automatiquement l'URL et le stockage

## 🔄 Flux d'Édition

### 1. **Chargement des Données**
- Récupération de la formation existante
- Affichage des fichiers existants avec leurs index
- Chargement des chapitres et ressources existants

### 2. **Modification**
- Ajout de nouveaux fichiers (index incrémentés)
- Modification des chapitres existants
- Ajout/suppression de ressources
- Modification du type de ressource (PDF/vidéo)

### 3. **Mise à Jour**
- Envoi des nouvelles données
- Conservation des fichiers existants
- Ajout des nouveaux fichiers
- Mise à jour des types de ressources

## 💡 Avantages de cette Structure

### **Clarté**
- **Types explicites** : PDF ou vidéo clairement définis
- **Index des fichiers** : Correspondance précise entre ressources et fichiers
- **Interface intuitive** : Sélection simple du type et du fichier

### **Flexibilité**
- **Multiples ressources** : Un chapitre peut avoir plusieurs fichiers
- **Types mixtes** : Mélange de PDF et vidéos dans un même chapitre
- **Gestion dynamique** : Ajout/suppression facile des ressources

### **Maintenabilité**
- **Structure cohérente** : Données uniformes pour toutes les ressources
- **Séparation des responsabilités** : Frontend gère la sélection, backend gère le stockage
- **Code modulaire** : Fonctions réutilisables pour la gestion des ressources

## 🛠️ Utilisation Technique

### **Création d'une Ressource**
```javascript
const addRessource = (chapitreIndex) => {
  setFormData(prev => ({
    ...prev,
    chapitres: prev.chapitres.map((chap, i) => 
      i === chapitreIndex 
        ? { 
            ...chap, 
            ressources: [
              ...chap.ressources,
              { 
                type: 'pdf', // Type par défaut
                fileIndex: files.length // Index du prochain fichier
              }
            ]
          }
        : chap
    )
  }));
};
```

### **Mise à Jour d'une Ressource**
```javascript
const updateRessource = (chapitreIndex, ressourceIndex, field, value) => {
  setFormData(prev => ({
    ...prev,
    chapitres: prev.chapitres.map((chap, i) => 
      i === chapitreIndex 
        ? {
            ...chap,
            ressources: chap.ressources.map((res, j) => 
              j === ressourceIndex 
                ? { ...res, [field]: value }
                : res
            )
          }
        : chap
    )
  }));
};
```

### **Envoi à l'API**
```javascript
const formationData = {
  ...formData,
  chapitres: formData.chapitres.map(chap => ({
    ...chap,
    ressources: chap.ressources.map(res => {
      // Envoi du type et de l'index du fichier
      return {
        type: res.type, // 'pdf' ou 'video'
        fileIndex: res.fileIndex
      };
    })
  }))
};

await formationService.createFormation(formationData, files);
```

## 🔍 Validation et Sécurité

### **Validation Côté Client**
- **Titre de formation** : Obligatoire
- **Catégorie** : Obligatoire
- **Chapitres** : Au moins un requis
- **Ressources** : Type et fichier obligatoires

### **Sécurité**
- **Types de fichiers** : Limités aux formats supportés
- **Taille maximale** : 100MB par fichier
- **Validation des types** : Seulement 'pdf' ou 'video'

## 📱 Interface Utilisateur

### **Page de Création**
- **Formulaire structuré** en sections logiques
- **Upload de fichiers** avec drag & drop
- **Gestion dynamique** des chapitres
- **Sélection du type** de ressource (PDF/vidéo)
- **Sélection du fichier** par index

### **Page d'Édition**
- **Chargement** des données existantes
- **Affichage** des fichiers existants
- **Ajout** de nouveaux fichiers
- **Modification** des types de ressources
- **Gestion** des index de fichiers

### **Page Principale**
- **Liste avec filtres** (recherche, catégorie, statut)
- **Actions rapides** (voir, modifier, supprimer)
- **Navigation** vers création/édition

## 🚨 Points d'Attention

### **Gestion des Index**
- **Correspondance** : Les `fileIndex` doivent correspondre aux fichiers uploadés
- **Suppression** : Attention lors de la suppression de fichiers
- **Mise à jour** : Mise à jour des index lors des modifications

### **Types de Ressources**
- **Validation** : Seulement 'pdf' ou 'video' acceptés
- **Cohérence** : Le type doit correspondre au fichier sélectionné
- **Interface** : Affichage clair du type sélectionné

### **Performance**
- **Taille des fichiers** : Limitation à 100MB
- **Nombre de ressources** : Gestion dynamique sans limite
- **Optimisation** : Chargement asynchrone des données

## 🔮 Évolutions Futures

### **Fonctionnalités Possibles**
- **Prévisualisation** des fichiers avant upload
- **Validation automatique** du type de fichier
- **Compression** automatique des vidéos
- **Gestion des versions** des ressources

### **Améliorations Techniques**
- **Upload progressif** avec barre de progression
- **Validation en temps réel** des types de fichiers
- **Cache intelligent** des fichiers fréquemment utilisés
- **Synchronisation** des métadonnées

## 📋 Exemple d'Utilisation

### **Création d'une Formation avec Ressources**

1. **Upload des fichiers** :
   - `document.pdf` (index 0)
   - `video_intro.mp4` (index 1)
   - `support_cours.pdf` (index 2)

2. **Création des chapitres** :
   - **Chapitre 1** : Introduction
     - Ressource 1 : Type "pdf", Fichier index 0
     - Ressource 2 : Type "video", Fichier index 1
   - **Chapitre 2** : Concepts avancés
     - Ressource 1 : Type "pdf", Fichier index 2

3. **Envoi à l'API** :
   ```json
   {
     "chapitres": [
       {
         "ressources": [
           {"type": "pdf", "fileIndex": 0},
           {"type": "video", "fileIndex": 1}
         ]
       },
       {
         "ressources": [
           {"type": "pdf", "fileIndex": 2}
         ]
       }
     ]
   }
   ```

4. **Backend** :
   - Traite les fichiers uploadés
   - Génère automatiquement les URLs
   - Stocke les métadonnées avec les types
   - Retourne la confirmation de création
