# Backend – Plateforme de Services

Ce backend Node.js/Express/MongoDB gère l’API sécurisée de votre plateforme de services (déblocage, licences, support, paiement, etc.).

## 1. Prérequis
- Node.js 16+
- MongoDB (local ou distant)

## 2. Installation

1. Placez-vous dans le dossier `back` :
   ```bash
   cd back
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

## 3. Configuration

Créez un fichier `.env` à la racine de `back` avec :
```
MONGO_URI=mongodb://localhost:27017/soutenance-project
JWT_SECRET=une_chaine_secrete_complexe
PORT=5000
```

## 4. Lancement du serveur

- En développement (avec redémarrage auto) :
  ```bash
  npm run server
  ```
- En production :
  ```bash
  npm start
  ```

## 5. Structure des dossiers

```
back/
├── config/           # Connexion MongoDB
├── controllers/      # Logique métier (auth, user, service, order, etc.)
├── data/             # Données de seed (services, users...)
├── middleware/       # Middlewares (auth, admin...)
├── models/           # Schémas Mongoose (User, Service, Order...)
├── routes/           # Définition des routes API
├── seeder.js         # Script pour peupler/vider la base
├── server.js         # Point d’entrée principal
└── .env              # Variables d’environnement
```

## 6. Principales routes API

- **/api/auth/** : Inscription, connexion, profil
- **/api/users/** : Mise à jour profil, changement mot de passe
- **/api/services/** : Liste des services
- **/api/orders/** : Passer commande, historique utilisateur
- **/api/licenses/** : Licences utilisateur
- **/api/payments/** : Paiements utilisateur
- **/api/support/** : Tickets/support utilisateur
- **/api/admin/** : Toutes les routes admin (CRUD services, users, commandes, tickets, paiements, licences)

Toutes les routes sensibles sont protégées par JWT et, pour l’admin, par un contrôle de rôle.

## 7. Seeder (données de test)

- Pour peupler la base avec des services de test :
  ```bash
  npm run data:import
  ```
- Pour tout supprimer :
  ```bash
  npm run data:destroy
  ```

## 8. Sécurité
- Authentification JWT (token dans l’en-tête Authorization)
- Middleware `protect` pour routes privées
- Middleware `admin` pour routes admin
- Mots de passe hashés (bcrypt)

## 9. Conseils de manipulation
- Toujours lancer MongoDB avant le backend
- Vérifier les logs du terminal pour toute erreur
- Adapter l’URL de l’API côté front dans `src/services/api.js` si besoin
- Pour ajouter des fonctionnalités avancées (paiement réel, logs, etc.), suivez la structure MVC déjà en place

## 10. Tests

### Tests manuels (recommandé à chaque livraison)
- Utilisez Postman, Insomnia ou le front pour tester chaque route clé :
  - Inscription, connexion, récupération du profil
  - Mise à jour du profil, changement de mot de passe
  - Consultation des services, passage de commande
  - Ajout de fonds, consultation des paiements
  - Création de ticket, consultation des tickets
  - Toutes les routes admin (CRUD services, users, commandes, etc.)
- Vérifiez les statuts HTTP, les messages d’erreur, la gestion des droits (JWT, admin).

### Tests automatisés (optionnel)
- Vous pouvez ajouter des tests avec [Jest](https://jestjs.io/) et [Supertest](https://github.com/ladjs/supertest) :
  1. Installez les dépendances :
     ```bash
     npm install --save-dev jest supertest
     ```
  2. Ajoutez un script dans `package.json` :
     ```json
     "test": "jest"
     ```
  3. Créez un fichier de test, par exemple `tests/auth.test.js` :
     ```js
     const request = require('supertest');
     const app = require('../server');
     describe('Auth', () => {
       it('should register a new user', async () => {
         const res = await request(app)
           .post('/api/auth/register')
           .send({ name: 'Test', email: 'test@test.com', password: 'Test1234' });
         expect(res.statusCode).toBe(201);
       });
     });
     ```
  4. Lancez les tests :
     ```bash
     npm test
     ```

---

Pour toute extension, ajoutez des tests pour chaque nouvelle route ou logique métier critique.

Ce backend est prêt pour la production et facilement extensible. Pour toute nouvelle fonctionnalité, créez un modèle, un contrôleur, une route, et sécurisez-la avec les middlewares existants.
