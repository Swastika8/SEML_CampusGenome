# Campus Genome 🧬

Campus Genome is an enterprise-grade, student-powered digital knowledge graph and campus intelligence platform. It replaces outdated, fragmented college information with real-time, verified student contributions, interactive schematic campus navigation, academic course guides, career insights, and curated campus lifestyle secrets.

Built with a modern full-stack decoupled architecture:
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Glassmorphism design system
- **Backend**: Node.js, Express REST API, PostgreSQL, JWT Authentication, Bcrypt
- **Architecture & Modeling**: StarUML `.mdj` state charts, class diagrams, and entity specifications

---

## 🌟 Key Features

1. **Authentication & Role-Based Access Control (RBAC)**
   - Secure login & student onboarding with handles (`@handle`), email, department, and graduation year.
   - BCrypt hashed passwords and JWT token authorization.
   - Dynamic reputation ranking system (`Helix`, `Chromosome`, `Nucleus`, `Moderator`).

2. **Interactive Schematic Campus Map**
   - Clickable campus zones with building intelligence, departments, lab timings, and facilities.

3. **Academic & Career Repositories**
   - 12 verified campus departments with curated subject guides, syllabus notes, and study material.
   - Interview archives, placement insights, and compensation benchmarks.

4. **Curated Campus Lifestyle & Verified Secrets**
   - Student secrets, late-night spots, campus hacks, and hidden study nooks.

5. **Live Unified Search & Moderated Contribution Engine**
   - Real-time global search across buildings, courses, secrets, and events.
   - Interactive contribution modals with image upload support and automated review status.

---

## 📁 Repository Structure

```text
SEML_CampusGenome/
├── backend/                  # Node.js & Express REST API
│   ├── src/
│   │   ├── config/           # Database pool & environment configs
│   │   ├── controllers/      # Route logic (auth, academics, buildings, etc.)
│   │   ├── db/               # PostgreSQL schema migrations, init & seed scripts
│   │   ├── middleware/       # JWT auth & centralized error handling
│   │   ├── routes/           # REST endpoints
│   │   └── server.js         # API entrypoint
│   ├── .env.example          # Sample environment variables
│   └── package.json
│
├── frontend/                 # React + Vite Single Page Application
│   ├── public/               # Static assets & college photography
│   ├── src/
│   │   ├── components/       # Layout, Modals, Wizards, Header & Sidebar
│   │   ├── context/          # Auth, Theme, Data & Contribution contexts
│   │   ├── data/             # Departments taxonomy & fallback data
│   │   ├── pages/            # Login, Dashboard, Academics, Career, Map, Lifestyle
│   │   ├── App.jsx           # Protected routing & layout hierarchy
│   │   └── main.jsx          # React DOM entry
│   └── package.json
│
├── postman/                  # Postman test suites
│   ├── CampusGenome.postman_collection.json
│   └── CampusGenome.postman_environment.json
│
├── CampusGenome.mdj          # Software Engineering UML & Class Models
├── CampusGenome2.mdj         # Component & Sequence Architecture
├── State_Chart.mdj           # State Transition Models
├── package.json              # Root npm scripts orchestration
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```
   Configure your PostgreSQL connection variables:
   ```env
   PORT=5000
   NODE_ENV=development
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=your_postgres_password
   PGDATABASE=CampusGenome
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

3. Initialize and seed the PostgreSQL database:
   ```bash
   npm run db:init
   npm run db:seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be live at `http://localhost:5000`.*

---

### 2. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open at `http://localhost:5173`.*

---

## 🔑 Demo Credentials

The database seeder provisions verified campus accounts for testing:

| Handle | Role | Rank Tier | Password |
| :--- | :--- | :--- | :--- |
| `@SwastikaSinha` | Moderator | Nucleus | `password123` |
| `@StudentJohn` | Student | Chromosome | `password123` |
| `@TechGuru` | Contributor | Chromosome | `password123` |
| `@CampusExplorer` | Contributor | Nucleus | `password123` |

---

## 🧪 API Testing with Postman

Import the provided files in the `postman/` directory:
1. Open Postman -> Click **Import**.
2. Select `postman/CampusGenome.postman_collection.json`.
3. Select `postman/CampusGenome.postman_environment.json`.
4. Switch your active environment to **CampusGenome Local Dev**.
5. Execute `POST /api/auth/login` to automatically populate the environment's `jwt_token`.

---

## 📜 License
Academic project built for Software Engineering & Modeling Laboratory (SEML).
