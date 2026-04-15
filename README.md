# 

## Architecture du projet
```
fingerprint-project/
└── backend/           # Node.js API
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   └── fingerprint.routes.js
│   │   ├── controllers/
│   │   │   └── fingerprint.controller.js
│   │   └── data/
│   │       └── fingerprints.json      ← généré automatiquement
│   └── package.json
│
├── frontend/          # Angular 19 app
    └── src/
        └── app/
            ├── app.component.ts/html/scss
            ├── app.config.ts
            ├── app.routes.ts
            ├── core/
            │   └── services/
            │       ├── api.service.ts
            │       └── fingerprint.service.ts
            └── features/
                ├── home/
                │   ├── home.component.ts
                │   ├── home.component.html
                │   └── home.component.scss
                └── dashboard/
                    ├── dashboard.component.ts
                    ├── dashboard.component.html
                    └── dashboard.component.scss

```

## Installation

### Prérequis
```
node --version    # >= 18.x
npm --version     # >= 9.x
ng version        # Angular CLI
```

npm install -g @angular/cli

### Création du Backend Node.js
mkdir backend
cd backend
npm init -y

#### Installation des dépendances backend
```
npm install express cors body-parser morgan fs-extra uuid
npm install --save-dev nodemon
```

### Création du Frontend Angular
ng new frontend --standalone --routing --style=scss --skip-tests
cd frontend

### Installation des dépendances frontend
npm install @fingerprintjs/fingerprintjs
npm install zone.js

## Lancer le projet
### Backend
cd backend
npm run dev
# ✅ http://localhost:3000

### Frontend
cd frontend
ng serve
# ✅ http://localhost:4200