# EcoSteel Asset-Management — SPA Web-App

Single-Page-Application (React Router v8, Framework Mode, SPA-Modus) für das
EcoSteel Asset-Management. Setzt die Wireframes aus Kapitel 4.3 um und
kommuniziert mit der REST-API aus Kapitel 4.2.

## Technologie-Stack

- React 19 + TypeScript
- React Router v8 (Framework Mode, `ssr: false` → reine SPA)
- Tailwind CSS 4 (EcoSteel Corporate-Design: Grün `#3ED058`, Stahlgrau-Verlauf)
- Vite als Build-Tool

## Voraussetzungen

- Node.js 20 oder neuer
- Die Basis-Applikation aus Kapitel 4.2 muss erreichbar sein (lokal oder
  produktiv auf Render)

## Setup

```bash
npm install
cp .env.example .env
# .env anpassen: VITE_API_BASE_URL auf die passende API-URL setzen
npm run dev
```

Die App ist danach unter `http://localhost:5173` erreichbar.

## Anmeldung

Da die Basis-API keine Benutzerkonten verwaltet, sondern einen einzelnen
API-Key voraussetzt (siehe Kapitel 4.2, `requireApiKey`-Middleware), dient
das Passwortfeld im Login als Eingabe für diesen Key:

- **E-Mail:** beliebig (nur Anzeigename in der App)
- **Passwort:** der API-Key aus der `.env`-Datei der Basis-Applikation
  (`API_KEY`)

## Produktions-Build

```bash
npm run build
npm start
```

## Projektstruktur

```
app/
├── lib/
│   ├── api.ts          API-Client für alle Aufrufe an die Asset-API
│   └── auth.ts          Speichern/Lesen des API-Keys im Browser
├── components/
│   ├── Logo.tsx          EcoSteel-Wortmarke
│   ├── Navbar.tsx        Obere Navigationsleiste
│   └── StatusBadge.tsx   Farbige Status-Anzeige (aktiv/wartung/ausser Betrieb)
├── routes/
│   ├── index.tsx              Weiterleitung je nach Login-Status
│   ├── login.tsx               Screen 1: Login
│   ├── _protected.tsx          Layout für alle Assets-Seiten (prüft Login)
│   ├── assets._index.tsx       Screen 2: Asset-Übersicht
│   ├── assets.new.tsx          Screen 3: Neues Asset anlegen
│   └── assets.$id.tsx          Screen 4+5: Bearbeiten & Löschen-Bestätigung
└── root.tsx
```
