# Scouts Webshop

[Live Demo](https://shop.lodlavki.be)

Dit project is een volledige webapplicatie voor de verkoop van producten voor een scoutinggroep. Het systeem ondersteunt zowel directe productverkoop als verkoop gekoppeld aan specifieke evenementen met tijdslots (shifts), zoals een spaghetti-avond. De applicatie is gebouwd met een moderne stack, inclusief Vue.js voor de frontend en Node.js voor de backend, en wordt gehost op Google Cloud Run.

## ✨ Belangrijkste Kenmerken

### Winkel- en Klantfunctionaliteit

- **Event-gebaseerde Verkoop**: Verkoop producten binnen de context van een specifiek event (bijv. "Spaghetti Avond") of als een algemene productverkoop.
- **Shift- en Tijdslotbeheer**: Voor evenementen zoals eetfestijnen kunnen klanten producten bestellen voor specifieke tijdslots, waarbij de capaciteit in real-time wordt bijgehouden.
- **Dynamische Winkelwagen**: Een moderne, uitklapbare winkelwagen met een zwevende widget die het totaal aantal items en de prijs toont.
- **Veilige Online Betalingen**: Volledige integratie met Stripe Checkout voor betalingen via creditcard, Bancontact en iDEAL.
- **Authenticatie**: Gebruikers kunnen inloggen met e-mail/wachtwoord of via Google. Nieuwe accounts worden automatisch geverifieerd via e-mail.
- **Bestelgeschiedenis**: Ingelogde gebruikers kunnen een overzicht van hun eerdere bestellingen bekijken.

### Admin Dashboard & Beheer

Een krachtig, beveiligd dashboard voor het volledige beheer van de webshop:

- **Eventbeheer**: Maak en beheer events van het type `Product Verkoop` of `Shift Event`.
- **Productbeheer**: Voeg producten toe met afbeeldingen, prijzen en beschrijvingen, en koppel ze aan een evenement.
- **Orderbeheer**: Bekijk en filter alle bestellingen met gedetailleerde statistieken over omzet en gemiddelde bestelwaarde.
- **Gebruikersbeheer**: Beheer gebruikers en wijs admin-rechten toe.
- **Google Services**: Beheer de OAuth2-koppeling met Google voor Gmail en Drive.
- **E-mail Delivery**: Monitor de status van verzonden orderbevestigingen.
- **Stripe Configuratie**: Schakel eenvoudig tussen de `test`- en `live`-modus van Stripe.

### Geavanceerde Backend Features

- **Google API Integratie**: Maakt gebruik van de Google API's met OAuth2 voor:
  - **Professionele E-mails**: Orderbevestigingen worden veilig verzonden via de Gmail API.
  - **Afbeeldingenopslag**: Productafbeeldingen worden beheerd via Google Drive voor eenvoudige toegang en opslag.
- **Performance Caching**: De backend maakt gebruik van een `FirebaseCachedService` om het aantal dure database-reads te minimaliseren en de prestaties te verbeteren.
- **Geoptimaliseerd Shiftbeheer**: De capaciteit van shifts wordt bijgehouden via een apart `ShiftCounter` systeem in de database, wat zorgt voor snelle en betrouwbare capaciteitscontroles zonder alle bestellingen te moeten doorzoeken.
- **CI/CD met Google Cloud**: Het project wordt automatisch gebouwd en geïmplementeerd via een `cloudbuild.yaml` configuratie die de applicatie als een Docker-container naar Google Cloud Run pusht.

## 🚀 Technische Stack

De applicatie is opgesplitst in een `client` en `server` directory binnen een monorepo-structuur.

### **Frontend (`client`)**

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Routing**: Vue Router
- **HTTP Client**: Axios

### **Backend (`server`)**

- **Framework**: Node.js met Express.js
- **Authenticatie**: Firebase Authentication
- **Database**: Firebase Firestore
- **Afbeeldingenopslag**: Google Drive API
- **E-mail Service**: Gmail API
- **Betalingen**: Stripe
- **Middleware**: CORS, Rate Limiting, en custom middleware voor authenticatie en autorisatie.

### **Platform & Hosting**

- **Hosting**: Google Cloud Run
- **CI/CD**: Google Cloud Build
- **Containerisatie**: Docker

## 🌐 Live Demo

De webshop is live en kan bezocht worden op:

**[https://shop.lodlavki.be](https://shop.lodlavki.be)**

_Let op: Het is mogelijk dat er momenteel geen actieve events zijn of dat de shop in testmodus staat._

## 📦 Projectstructuur

Het project is een monorepo met twee hoofdmappen:

- `client/`: Bevat de volledige Vue.js frontend applicatie.
  - `src/components/`: Herbruikbare Vue-componenten, georganiseerd per feature (admin, auth, events, etc.).
  - `src/views/`: Pagina-componenten die door Vue Router worden gebruikt.
  - `src/stores/`: Pinia stores voor state management (auth, notificaties).
  - `src/composables/`: Vue Composition API-functies voor herbruikbare logica (checkout, event management).
- `server/`: Bevat de Node.js/Express backend.
  - `features/`: De core logica, opgesplitst per feature (auth, admin, products, etc.), elk met eigen routes en controllers.
  - `core/`: Gedeelde services en controllers (base controller, Firebase services, Stripe service).
  - `middleware/`: Express middleware voor authenticatie (`authenticate`) en admin-autorisatie (`authorizeAdmin`).

## ⚙️ Installatie en Opstarten

1. **Clone de repository:**

   ```bash
   git clone https://github.com/Benjamin-sa/betaling-2.0.git
   cd betaling-2.0
   ```

2. **Omgevingsvariabelen (.env):**
   Maak een `.env`-bestand aan in de `server/`-directory en vul de vereiste variabelen in. Zie `cloudbuild.yaml` voor een overzicht van de variabelen die nodig zijn voor productie. Een voorbeeld:

   ```env
   # Firebase
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/firebase-credentials.json

   # Stripe
   STRIPE_SECRET_KEY_TEST=sk_test_...
   STRIPE_PUBLIC_KEY_TEST=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Gmail
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   GMAIL_FROM_NAME="Scouts Lod Lavki"
   GMAIL_USER_EMAIL=jouw-email@gmail.com

   # App
   APP_URL=http://localhost:8080
   VITE_APP_URL=http://localhost:8080
   ```

3. **Installeer alle dependencies:**
   Voer dit commando uit vanuit de root van het project. Dit installeert de dependencies voor zowel de root, de client als de server.

   ```bash
   npm run install:all
   ```

4. **Start de servers:**

   - **Backend Server (Node.js):**

     ```bash
     # Start met automatische herlaadfunctionaliteit
     npm run dev --prefix server
     ```

   - **Frontend Dev Server (Vite):**

     ```bash
     npm run dev --prefix client
     ```

De frontend is nu beschikbaar op `http://localhost:5173` en de backend op `http://localhost:8080`.
