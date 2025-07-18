# The Players Academy

Idag saknar många idrottsföreningar ett modernt och lättillgängligt verktyg för att administrera lag, tränare och utbildningar. Mycket sköts fortfarande via mejl, Excel-filer eller manuella listor — vilket gör det svårt att hålla ordning och följa upp vilka utbildningar som genomförts.

Därför har vi tagit fram en modern webbapplikation för att effektivisera och digitalisera hanteringen av sportlag, tränare och kurser. Med **Players Academy** kan föreningar enkelt registrera sig, administrera och tilldela kurser till sina lag och tränare. Utbildningarna som tränarna inom föreningen tar del av tillhandahålls med hjälp av **Learnifier**.

## 👤 Team

**Fullstackutvecklare**
- Andréa Stålstierna ([LinkedIn](https://www.linkedin.com/in/andr%C3%A9a-st%C3%A5lstierna-489867121/))
- Andreas Johansson ([GitHub](https://github.com/johansson-andreas) | [LinkedIn](https://www.linkedin.com/in/andreas-johansson92/))
- Erik Andersson ([GitHub]https://github.com/Erik-Fullstack) | ([LinkedIn](https://www.linkedin.com/in/erik-andersson-a29022327/))
- Filip Hansén ([LinkedIn](https://www.linkedin.com/in/filip-hansen-650115170/))
- Ida Öhlén ([GitHub](https://github.com/idaohlen/) | [LinkedIn](https://www.linkedin.com/in/idaohlen/))
- Hanna Österberg ([LinkedIn](https://www.linkedin.com/in/hanna-%C3%B6sterberg-4b963b203/))
- Martin Södersten ([GitHub](https://github.com/martinsodersten) | [LinkedIn](https://www.linkedin.com/in/martin-s%C3%B6dersten-78a974171/]))
- Therese Perswalld ([LinkedIn](https://www.linkedin.com/in/therese-perswalld-1b07a751/))

**UI/UX**
- Larisa Sekiro ([LinkedIn](https://www.linkedin.com/in/larisa-sekiro-034a618a/))
- Natasa Kocic ([LinkedIn](https://www.linkedin.com/in/natasa-kocic/))

**DevOps**
- Anab Mohamed Abdullahi ([LinkedIn](https://www.linkedin.com/in/anab-mohamed-abdullahi-8436a021b/))
- Kianoosh Parnan ([LinkedIn](https://www.linkedin.com/in/kianooshparnan/))

## 📁 Projektstruktur

Projektet består av två huvudsakliga delar:

### 📦 Frontend (`/vite`)

- React-baserad single-page-applikation
- Byggd med **Vite** för snabb utveckling och optimerade byggen
- Använder **TypeScript** för typkontroll
- Styling med **Tailwind CSS** och **HeroUI-komponenter**
- State management med **Zustand**
- Formulärhantering med **React Hook Form** och validering via **Zod**

### 🔌 Backend (`/express_api`)

- **Express.js** REST API
- **TypeScript** för typkontroll
- **Prisma ORM** för databashantering
- **PostgreSQL-databas**
- **Google OAuth** för inloggning
- Autentisering med **Passport.js**
- Integrering med externt API från **Learnifier**

## 🚀 Huvudfunktioner och Navigering

**Vårt användargränssnitt är uppdelat i tre olika vyer beroende på vilken roll som är inloggad.**

Som **användare (_User_)** i vår applikation loggar man enkelt in via **OAuth** och får direkt tillgång till sina kurser. Från spelarpanelen kan användaren:

- Se vilka kurser som tilldelats.
- Följa sina framsteg i varje kurs.
- Klicka sig vidare till **Learnifier** för att genomföra utbildningen.
- Se vilken förening man tillhör.
- Hantera sina profilinställningar och personliga uppgifter.

Det skapar en tydlig, anpassad upplevelse där varje användare snabbt hittar relevant information och funktionalitet baserat på sin roll.

**För föreningsadministratörer (_Admin_) erbjuder applikationen ett komplett och överskådligt verktyg för lag- och kursadministration.**

I adminpanelen kan föreningen:

- Skapa och administrera lag inom föreningen.
- Tilldela tränare till respektive lag.
- Följa lagens statistik och utveckling över tid.
- Koppla kurser och träningsprogram till varje lag.
- Planera, strukturera och följa upp både lagens träning och tränarnas utbildningar.

Det här gör det enkelt för föreningar att hålla koll på organisationen, utbildningsnivåer och säkerställa att alla lag och tränare får rätt förutsättningar för utveckling.

**För vår beställare har vi skapat en särskild roll, (_Superadmin_)**, som har en övergripande behörighet och full kontroll över applikationens innehåll och användare.

Superadmin har tillgång till i stort sett allt som en föreningsadmin kan göra, men utöver det även möjligheten att:

- Skapa och administrera kurser.
- Hantera allt innehåll och texter på samtliga sidor.
- Se statistik över antal registrerade föreningar och användare.
- Följa statistik för enskilda föreningar.
- Hålla koll på antalet tillgängliga kursplatser.
- Ta emot och hantera feedback från användare via en inkorgsvy.

Det här ger beställaren ett smidigt och kraftfullt verktyg för att administrera hela plattformen och säkerställa att både innehåll och användarupplevelse håller hög kvalitet.

## 🛠️ **Vidareutveckling**

Projektet är i dagsläget en fungerande och stabil grundversion, men det finns flera områden som kan vidareutvecklas för att skapa en ännu mer komplett och skalbar applikation.

På **frontend-sidan** finns möjligheter att förfina detaljer och användarflöden för en ännu bättre användarupplevelse. Exempelvis skulle tydligare felhantering i formulär, visuella feedback-komponenter och förbättrad responsivitet i vissa vyer ge ett mer professionellt helhetsintryck.

På **backend-sidan** finns utrymme att optimera och säkra API:erna ytterligare, implementera enhetliga valideringar samt lägga till fler automatiserade tester för att förebygga oväntade fel och förbättra driftstabiliteten. Vi ser även potential i att utveckla funktioner för statistikvisualisering, användarnotifikationer och stöd för fler typer av utbildningsmaterial via externa API:er.

Utöver detta skulle projektet vinna på en fullständig teknisk genomgång för att säkerställa stabilitet, prestanda och långsiktig skalbarhet inför eventuell produktion.

**Funktioner vi planerade men inte hann implementera:**

- Möjlighet för **Superadmin** att se statistik över inkomst och redigera information för specifika föreningar.
- Utökad information för **Admin-användare** gällande abonnemang och fakturor.
- Integration av **Stripe** som betalningslösning för hantering av abonnemang och betalningar.

Dessa delar finns med i vår roadmap för framtida vidareutveckling och skulle tillsammans bidra till en ännu mer komplett och användarvänlig plattform.

## Screenshots

![Startsidan](images/screenshot_01.png)
![Frågor och svar](images/screenshot_02.png)
![Kom igång](images/screenshot_03.png)
![Våra tränare](images/screenshot_04.png)
![Hantera tränare](images/screenshot_05.png)

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd theplayersacademy
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_KEY=your_session_key
   SECRET_SESSION_KEY=your_secret_session_key
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Servers**
   ```bash
   # Backend (port 3000)
   cd backend
   npm run dev
   
   # Frontend (port 5173)
   cd frontend
   npm run dev
   ```

**Note:** Learnifier integration is optional - the app will run without those credentials.
