# 🔐 POC FingerprintJS - Version Gratuite vs Pro

Ce projet est un POC (Proof of Concept) qui compare les fonctionnalités de **FingerprintJS Open Source** (gratuit) et **FingerprintJS Pro** (payant).

## 📋 Architecture

Le projet utilise une architecture unifiée avec :
- **1 Frontend Angular** : avec menu de sélection et deux versions
- **1 Backend Node.js/Express** : gérant les deux APIs

```
dfc-fingerprint-poc/
├── frontend/              # Application Angular
│   ├── src/app/
│   │   ├── features/
│   │   │   ├── menu/                 # Menu de sélection
│   │   │   ├── home/                 # Version Open Source
│   │   │   ├── home-pro/             # Version Pro
│   │   │   └── dashboard/            # Dashboard (commun)
│   │   ├── core/services/
│   │   │   ├── fingerprint.service.ts      # Service Open Source
│   │   │   └── fingerprint-pro.service.ts  # Service Pro
│   │   └── environments/
│   │       └── environment.ts        # Configuration (clé API Pro)
│
└── backend/               # Serveur Node.js
    ├── src/
    │   ├── controllers/
    │   │   ├── fingerprint.controller.js       # Controller Open Source
    │   │   └── fingerprint-pro.controller.js   # Controller Pro
    │   ├── routes/
    │   │   ├── fingerprint.routes.js
    │   │   └── fingerprint-pro.routes.js
    │   └── data/
    │       ├── fingerprints.json         # Données Open Source
    │       └── fingerprints-pro.json     # Données Pro
    └── .env                              # Configuration serveur
```

## 🚀 Installation

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. Configuration de la clé API Pro

#### Frontend
Éditez `frontend/src/environments/environment.ts` :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  fingerprintPro: {
    apiKey: 'VOTRE_CLE_API_PUBLIQUE',  // ← Ajoutez votre clé
    region: 'eu',
    endpoint: 'https://eu.api.fpjs.io'
  }
};
```

#### Backend
Éditez `backend/.env` :
```env
PORT=3000
FINGERPRINT_PRO_SECRET_KEY=VOTRE_CLE_SECRETE  # ← Ajoutez votre clé
FINGERPRINT_PRO_REGION=eu
```

> 💡 **Obtenir vos clés API** : [https://dashboard.fingerprint.com/](https://dashboard.fingerprint.com/)

## 🏃 Lancement

### Terminal 1 - Backend
```bash
cd backend
npm start
```
Le serveur démarre sur `http://localhost:3000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
L'application démarre sur `http://localhost:4200`

## 🎯 Utilisation

1. Ouvrez `http://localhost:4200` dans votre navigateur
2. Vous verrez un **menu avec 2 cartes** :
   - **Version Gratuite** (Open Source)
   - **Version Pro** (Professional)
3. Cliquez sur l'une des deux versions pour tester

## 🆓 Version Open Source

**Fonctionnalités :**
- ✅ Identification navigateur locale
- ✅ ~60 composants collectés (canvas, fonts, audio, etc.)
- ✅ VisitorId généré côté client
- ✅ Gratuit et sans limite

**Route :** `/free`

**API Backend :**
- `POST /api/fingerprints` - Enregistrer une empreinte
- `GET /api/fingerprints` - Récupérer toutes les empreintes
- `GET /api/fingerprints/stats/summary` - Statistiques
- `DELETE /api/fingerprints` - Supprimer toutes les empreintes

## 💎 Version Pro

**Fonctionnalités :**
- ✨ Identification serveur (99.5% de précision)
- ✨ Détection incognito/navigation privée
- ✨ Détection VPN et proxy
- ✨ Détection des bots
- ✨ Géolocalisation avancée (ville, pays)
- ✨ Historique des visites
- ✨ Score de confiance amélioré
- ✨ Vérification côté serveur

**Route :** `/pro`

**API Backend :**
- `POST /api/fingerprints-pro` - Enregistrer et vérifier une empreinte Pro
- `GET /api/fingerprints-pro` - Récupérer toutes les empreintes Pro
- `GET /api/fingerprints-pro/stats/summary` - Statistiques Pro
- `DELETE /api/fingerprints-pro` - Supprimer toutes les empreintes Pro

## 📊 Différences clés

| Caractéristique | Open Source | Pro |
|----------------|-------------|-----|
| **Précision** | ~90% | 99.5% |
| **Identification** | Côté client | Côté serveur |
| **Détection Incognito** | ❌ | ✅ |
| **Détection VPN** | ❌ | ✅ |
| **Détection Bots** | ❌ | ✅ |
| **Géolocalisation** | ❌ | ✅ (Ville, Pays) |
| **Historique** | ❌ | ✅ |
| **Coût** | Gratuit | Payant |

## 🛠️ Technologies utilisées

### Frontend
- **Angular 21** (standalone components)
- **RxJS** pour la gestion asynchrone
- **@fingerprintjs/fingerprintjs** (open source)
- **@fingerprintjs/fingerprintjs-pro** (version pro)

### Backend
- **Node.js** + **Express**
- **@fingerprintjs/fingerprintjs-pro-server-api** (vérification serveur)
- **fs-extra** pour la gestion des fichiers
- **cors** pour les requêtes cross-origin

## 🔐 Sécurité

- ⚠️ **Ne commitez JAMAIS** vos clés API dans Git
- Les fichiers `.env` et `environment.ts` contenant les clés sont dans `.gitignore`
- Utilisez `.env.example` comme template

## 📚 Documentation

- [FingerprintJS Open Source](https://github.com/fingerprintjs/fingerprintjs)
- [FingerprintJS Pro Documentation](https://dev.fingerprint.com/)
- [Dashboard Pro](https://dashboard.fingerprint.com/)

## 🧪 Test

Pour tester la détection incognito (Pro uniquement) :
1. Allez sur la version Pro
2. Ouvrez une fenêtre de navigation privée
3. Accédez à la même URL
4. La version Pro devrait détecter le mode incognito

## 📝 Notes

- Le backend stocke les données dans des fichiers JSON locaux
- Chaque version (gratuite/pro) a son propre fichier de données
- Les statistiques sont calculées en temps réel
- Le backend vérifie les empreintes Pro côté serveur via l'API FingerprintJS

## 🤝 Support

Pour toute question sur FingerprintJS Pro :
- [Documentation officielle](https://dev.fingerprint.com/)
- [Support](https://fingerprint.com/support/)

---

**Développé avec ❤️ pour comparer FingerprintJS Open Source vs Pro**
