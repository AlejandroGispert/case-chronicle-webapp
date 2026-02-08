# Case Chronicles

An interactive web application designed to help users log, track,
and visualize individual cases or events, whether it's reports, incident tracking, issues, or investigative tasks.
Built with a focus on clarity and user-centric design, the app is especially useful for individuals who need
to present and manage their case history to a caseworker, advisor, or handler in a structured and organized way.

## Development setup

For local setup (including fixing “Google login redirects to Netlify”), see **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**.

### Run the app

| Command           | Description                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `npm run dev`     | Start the dev server (Vite). Open the URL shown in the terminal (e.g. http://localhost:5173). |
| `npm run build`   | Build for production.                                                                         |
| `npm run preview` | Serve the production build locally (run after `npm run build`).                               |

### Test

| Command                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| `npm run test:e2e`         | Run E2E tests headless (Playwright).         |
| `npm run test:e2e:ui`      | Run E2E tests with Playwright UI.            |
| `npm run test:e2e:headed`  | Run E2E tests with browser visible.          |
| `npm run test:e2e:debug`   | Run E2E tests in debug mode.                 |
| `npm run test:e2e:codegen` | Open Playwright Codegen to record new tests. |
| `npm run lint`             | Run ESLint.                                  |

## What It Does

Case Chronicles lets users:

📝 Log and categorize cases with detailed notes, timestamps, and custom tags

📅 Track the timeline of events to build a clear overview

📂 Easily filter, search, and sort through multiple entries

## How It Works

Users log new cases through a clean and intuitive interface.

The app stores data in a structured format using a backend (Node.js/Express + database).

A dashboard provides real-time filtering, search, and statistical views.

Responsive frontend built with [React/Vite].

Bonus: Built with modern tooling, clean code, and scalable design patterns to allow for
future integrations.

## Why I Built This

As a full-stack developer passionate about solving real problems and crafting meaningful user experiences, I created Case Chronicles to:

🧠 Demonstrate my ability to design and build complete web solutions — from concept to deployment

🔍 Showcase real-world use of API integration, filtering logic, and data visualization

🛠 Empower users to spot trends, resolve issues faster, and make smarter decisions through thoughtful software

🤝 Support a friend who needed a simple but powerful tool to keep track of case events

### Looking to Collaborate or Hire?

If you're a recruiter or tech lead looking for a proactive, creative, and
detail-driven developer, feel free to connect:

📧 Email: alejandrobusiness2022@gmail.com
