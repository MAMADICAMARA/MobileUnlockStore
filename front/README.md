# Front-end du Projet de Plateforme de Services

Ce document décrit l'architecture, l'installation et les fonctionnalités de la partie front-end de l'application, développée avec React.

## 1. Description

L'application est une interface utilisateur riche et réactive conçue pour une plateforme de services en ligne (déblocage de téléphones, licences logicielles, etc.). Elle comprend un espace public, un espace client sécurisé et un back-office complet pour l'administration.

## 2. Technologies Utilisées

- **React 18** : Bibliothèque principale pour la construction de l'interface utilisateur.
- **React Router DOM v6** : Pour la gestion du routage côté client.
- **Tailwind CSS** : Framework CSS "utility-first" pour un design rapide et responsive.
- **Axios** : Client HTTP pour la communication avec l'API backend.
- **JWT Decode** : Pour décoder les tokens JWT et extraire les informations de l'utilisateur.
- **Vite** : Outil de build front-end pour un développement rapide.

## 3. Installation et Lancement

Assurez-vous d'avoir [Node.js](https://nodejs.org/) (version 16+ recommandée) installé sur votre machine.

1.  **Cloner le dépôt** (si applicable) et naviguer dans le dossier `front`:
    ```bash
    cd front
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```
    ou si vous utilisez Yarn :
    ```bash
    yarn install
    ```

3.  **Configurer l'API** :
    Ouvrez le fichier `src/services/api.js` et modifiez la variable `baseURL` pour qu'elle corresponde à l'URL de votre backend :
    ```javascript
    const api = axios.create({
      baseURL: 'https://gsmguineeunlockstore-backend.onrender.com/api', // Modifiez cette ligne
      // ...
    });
    ```

4.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    ou
    ```bash
    yarn dev
    ```
    L'application sera alors accessible à l'adresse `http://localhost:5173` (ou un autre port si celui-ci est déjà utilisé).

## 4. Structure du Projet

Le code source est organisé dans le dossier `src/` de manière modulaire et évolutive :

```
src/
├── components/     # Composants réutilisables (Header, Footer, Modals, etc.)
│   ├── layout/     # Layouts principaux (ClientLayout, AdminLayout)
│   └── admin/      # Composants spécifiques à l'admin (ServiceForm)
├── context/        # Contexte React (AuthContext pour l'authentification)
├── hooks/          # Hooks personnalisés (useAuth pour un accès simple au contexte)
├── pages/          # Composants de page, organisés par section
│   ├── auth/       # Pages de connexion et d'inscription
│   ├── client/     # Pages de l'espace client (Dashboard, Orders, etc.)
│   └── admin/      # Pages de l'espace admin (AdminDashboard, etc.)
├── services/       # Logique de communication avec l'API (authService, orderService, etc.)
├── App.jsx         # Composant racine qui définit le routage principal
├── main.jsx        # Point d'entrée de l'application
└── index.css       # Fichier de styles globaux (configuration Tailwind)
```

## 5. Fonctionnalités Implémentées

### Espace Public
- **Pages Statiques** : `HomePage`, `FAQPage`, `ContactPage` entièrement stylées avec Tailwind CSS.
- **Navigation Principale** : Un `Header` et un `Footer` réutilisables sur toutes les pages publiques.
- **Page des Services (`ServicesPage`)** :
    - Affichage des services sous forme de cartes (`ServiceCard`).
    - Système de **filtres** par catégorie et **barre de recherche**.
    - **Modal de commande (`ServiceModal`)** dynamique qui s'ouvre sans recharger la page.

### Authentification
- **Système de Token JWT** : La connexion génère un token qui est stocké dans le `localStorage`.
- **Contexte d'Authentification (`AuthContext`)** : Un contexte global fournit l'état de l'utilisateur (`user`, `isAuthenticated`) à toute l'application.
- **Routage Protégé (`ProtectedRoute`)** : Un composant qui protège les routes en vérifiant si l'utilisateur est authentifié et a le rôle requis (`client` ou `admin`).
- **Intercepteur Axios** : Le token JWT est automatiquement ajouté à l'en-tête de chaque requête envoyée au backend.

### Espace Client (accessible après connexion)
- **Layout dédié (`ClientLayout`)** avec une barre de navigation latérale.
- **Tableau de bord (`DashboardPage`)** : Vue d'ensemble des activités du client.
- **Gestion des Commandes (`OrdersPage`)** : Historique complet des commandes avec option de tri.
- **Gestion des Licences (`LicensesPage`)** : Liste des licences avec statut (Actif/Expiré).
- **Support Client** : Pages pour consulter (`TicketsPage`) et créer (`SupportPage`) des tickets de support.
- **Gestion de Profil (`ProfilePage`)** : Mise à jour des informations personnelles et changement de mot de passe.

### Espace Administration (accessible avec un compte admin)
- **Layout dédié (`AdminLayout`)** avec une navigation spécifique.
- **Tableau de bord (`AdminDashboardPage`)** : Statistiques clés sur l'activité du site.
- **Gestion CRUD des Services (`AdminServicesPage`)** : Interface complète pour ajouter, modifier et supprimer des services via un formulaire dans un modal.
- **Gestion des Commandes (`AdminOrdersPage`)** : Vue de toutes les commandes avec filtres et possibilité de changer leur statut.
- **Gestion des Clients (`AdminUsersPage`)** : Liste de tous les utilisateurs avec une fonction de recherche.
- **Gestion de Contenu (`AdminContentPage`)** : Permet de modifier le contenu de la FAQ.
- **Gestion du Support (`AdminSupportPage`)** : Vue centralisée de tous les tickets de support.
- **Autres pages de gestion** : Historique des paiements et gestion des comptes administrateurs.

---

Ce front-end est maintenant prêt à être connecté à un backend qui respecte les routes d'API définies dans les fichiers du dossier `src/services/`.
