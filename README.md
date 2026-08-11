# Campus Genome Frontend (Software Engineering Laboratory)

This project contains the complete front-end user interface for "Campus Genome," a digital knowledge base (DNA) for college campuses, powered by verified student contributions. It is built as a single-page React application using Tailwind CSS for styling and `react-joyride` for the product tour.

*This project is front-end only and does not contain backend logic, authentication, or real data persistence. Data is mocked for UI demonstration purposes.*

## Key Technical Features & Implementations

*   **Interactive Schematic Map:** A custom SVG map interface with clickable zones for key campus buildings, opening dynamic info panels.
*   **Knowledge Evolution Visualization:** Data points feature a visual history view/timeline.
*   **Trust & Verification UI:** Real-time verified badges and reputation ranking display on mocked user contributions.
*   **Senior-Level Aesthetic:** Custom structured layouts, advanced CSS transitions, and advanced form wizard design (avoiding standard card grids).
*   **Dynamic Theme Toggle:** Comprehensive support for light and dark modes.
*   **React-Joyride Tour:** Built-in guided product tour on the dashboard.

## File Structure and Purpose

root/
├── public/                # Static assets (images, icons)
│   └── background.png     # (The college image, image_5.png)
│
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components (buttons, search, theme-toggle)
│   │   │   ├── Button.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── VerificationChip.jsx
│   │   │
│   │   ├── layout/        # Major structural components
│   │   │   ├── Header.jsx       # Navigation, logo, global search, theme toggle
│   │   │   ├── DashboardLayout.jsx # Handles the overlay background image
│   │   │   └── InfoSidePanel.jsx   # Contextual sidebar for map interaction
│   │   │
│   │   ├── modules/       # Components specific to features
│   │   │   ├── MapView.jsx     # Controls the schematic map interactions
│   │   │   ├── ContributionWizard.jsx # Multi-step form for adding knowledge
│   │   │
│   │   └── dashboard/      # Specific components for the main landing view
│   │       ├── HeroMessage.jsx
│   │       ├── Ticker.jsx
│   │       └── ContributorList.jsx
│   │
│   ├── context/           # React Context providers
│   │   ├── DataContext.jsx     # Stores the mocked knowledge data
│   │   ├── ThemeContext.jsx    # Manages light/dark mode state
│   │   └── ContributionContext.jsx # Handles form wizard state
│   │
│   ├── data/              # Mocked data structures (JSON files)
│   │   ├── buildings.json
│   │   ├── courses.json
│   │   └── users.json
│   │
│   ├── pages/             # Major page views (routed)
│   │   └── Dashboard.jsx     # Main landing page with hero, search, map
│   │
│   ├── App.jsx            # Main app component with routing
│   ├── index.css          # Global styles (Tailwind base)
│   └── main.jsx           # Entry point
│
├── tailwind.config.js    # Tailwind CSS configuration (fonts, colors)
└── README.md              # This file


### Installation and Usage

1.  Clone the repository.
2.  Run `npm install` to install dependencies (React, Tailwind CSS, react-joyride).
3.  Run `npm run dev` to view the application locally.

### Modifying the Tour

The configuration for the React-Joyride tour can be found in `src/pages/Dashboard.jsx`. Modifying the `steps` array will change the tour.

### Mock Data

The application runs purely on mock data provided in `src/data/`. For demonstration, this data can be modified. *Changes made through the Contribution Wizard will not persist.*
