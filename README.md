# Scouts Webshop

Dit project is een volledige webapplicatie voor de verkoop van producten voor een scoutinggroep. Het ondersteunt zowel directe productverkoop als verkoop gekoppeld aan specifieke evenementen met tijdslots (shifts). De applicatie is gebouwd met een moderne stack, inclusief Vue.js voor de frontend en Node.js/Express voor de backend, en maakt gebruik van Firebase voor de database en authenticatie, en Stripe voor de betalingen.

## ✨ Belangrijkste Kenmerken

- **Event Management**: Creëer en beheer twee soorten events:
  - **Product Verkoop**: Een standaard webshop voor de verkoop van producten.
  - **Shift Event**: Verkoop van producten gekoppeld aan specifieke tijdslots (bijv. een spaghetti-avond).
- **Productbeheer**: Admins kunnen producten toevoegen, verwijderen en koppelen aan evenementen, inclusief afbeeldingen.
- **Authenticatie**: Gebruikers kunnen zich registreren en inloggen met e-mail/wachtwoord of via Google (Firebase Auth).
- **Admin Dashboard**: Een beveiligde admin-sectie voor het beheren van events, producten, gebruikers en het bekijken van alle bestellingen.
- **Winkelwagensysteem**: Een moderne, uitklapbare winkelwagen met een zwevende widget die het totaal aantal items toont.
- **Stripe Integratie**: Veilige online betalingen via Stripe Checkout, met ondersteuning voor creditcard, iDEAL en Bancontact.
- **Bestelgeschiedenis**: Ingelogde gebruikers kunnen hun eigen bestelgeschiedenis bekijken.
- **Caching**: De backend maakt gebruik van een caching-laag (`FirebaseCachedService`) om het aantal database-reads te verminderen en de prestaties te verbeteren.

## 🚀 Technische Stack

De applicatie is opgesplitst in een `client` en `server` directory.

### Frontend (`client`)

- **Framework**: [Vue.js 3](https://vuejs.org/) (met de Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend (`server`)

- **Framework**: [Node.js](https://nodejs.org/) met [Express.js](https://expressjs.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authenticatie**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Betalingen**: [Stripe](https://stripe.com/)
- **Afbeeldingenopslag**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **Middleware**: CORS, JSON-parser, en custom middleware voor authenticatie en autorisatie.

## 📦 Projectstructuur

Het project volgt een monorepo-structuur met twee hoofdmappen:

- `client/`: Bevat de volledige Vue.js frontend applicatie.
  - `src/components/`: Herbruikbare Vue-componenten, georganiseerd per feature (admin, auth, events, etc.).
  - `src/views/`: Pagina-componenten die door Vue Router worden gebruikt.
  - `src/stores/`: Pinia stores voor state management (auth, notificaties).
  - `src/composables/`: Vue Composition API-functies voor herbruikbare logica (checkout, event management).
  - `src/router/`: Definitie van de routes en navigatie-guards.
  - `src/services/`: API-client voor communicatie met de backend.
- `server/`: Bevat de Node.js/Express backend.
  - `features/`: De core logica, opgesplitst per feature (auth, admin, products, etc.), elk met eigen routes en controllers.
  - `core/`: Gedeelde services en controllers (base controller, Firebase services, Stripe service).
  - `config/`: Configuratie voor externe services zoals Firebase.
  - `middleware/`: Express middleware voor authenticatie (`authenticate`) en admin-autorisatie (`authorizeAdmin`).
