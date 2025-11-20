
# EventBuddy Frontend

Interactive Next.js 16 application for discovering events, managing admin listings, and booking seats with real-time availability driven by the EventBuddy backend API.

## Backend Reference

- **API Repo:** [EventBuddy Backend](https://github.com/Foysal-Munsy/EventBuddy-Backend)
- Start the backend before running the frontend or booking requests will fail. The frontend expects the backend at `http://localhost:8000` by default (adjust `BASE_URL` if different).

## Admin Credentials

Use the seeded admin account to access `/admin`:

- **Email:** `eventbuddy.admin@gmail.com`
- **Password:** `admin123`


## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 (utility classes) & custom gradients
- **UI Helpers:** `react-icons`, `sweetalert2`
- **Language/Tooling:** TypeScript, ESLint 9

## Prerequisites

- Node.js **>= 20** (aligns with Next.js 16 requirements)
- npm (bundled with Node) or another compatible package manager
- Running EventBuddy backend API (see link below)

## Environment Setup

1. Clone the repository and install dependencies:

	```bash
	git clone <this-repo-url>
	cd eventbuddy-frontend
	npm install
	```

2. Provide API environment variables. Create `.env.local` in the project root:

	```bash
	BASE_URL=http://localhost:8000
	```

	`BASE_URL` must point to the backend instance that exposes `/events`, `/events/:id`, `/events/my-bookings`, etc.

## Common Commands

| Command          | Description |
| ---------------- | ----------- |
| `npm run dev`    | Start local dev server at `http://localhost:3000` with hot reload. |
| `npm run lint`   | Run ESLint using the Next.js config. |
| `npm run build`  | Create an optimized production build. |
| `npm run start`  | Serve the production build (after `npm run build`). |
| `npm run dev`     | Launch the development server (preferred during feature work). |



## Features Overview

- Public landing page with hero, upcoming events, and previous events.
- Event details page with seat selector, booking workflow, and seat availability logic.
- Auth-gated admin dashboard for CRUD operations on events.
- Auth-gated user dashboard fetching real bookings from `GET /events/my-bookings`.
- SweetAlert-driven flow for booking confirmation, errors, and auth prompts.

## Screenshots

### Admin Dashboard
![Admin Dashboard](https://github.com/Foysal-Munsy/readme-assets/blob/main/eventbuddy-frontend/admin-dashboard.png)

### Create Event - Admin
![Create Event - Admin](https://github.com/Foysal-Munsy/readme-assets/blob/main/eventbuddy-frontend/admin-create-event.png)

### Edit Event - Admin
![Edit Event - Admin](https://github.com/Foysal-Munsy/readme-assets/blob/main/eventbuddy-frontend/edit-event.png)

### Delete Event - Admin
![Delete Event - Admin](https://github.com/Foysal-Munsy/readme-assets/blob/main/eventbuddy-frontend/delete-event.png)

---

### User Dashboard
![User Dashboard](https://github.com/Foysal-Munsy/readme-assets/blob/main/eventbuddy-frontend/user-dashboard.png)

### Event Book - User
![Event Book - User](https://github.com/Foysal-Munsy/readme-assets/blob/main/eventbuddy-frontend/user-book.png)

### Event Details
![Event Details](https://github.com/Foysal-Munsy/readme-assets/blob/main/eventbuddy-frontend/event-detailss.png)

## Dependencies

| Package | Purpose |
| ------- | ------- |
| `next@16` | App router framework, routing, server components. |
| `react@19` / `react-dom@19` | UI rendering. |
| `tailwindcss@4` + `@tailwindcss/postcss` | Styling utilities. |
| `dotenv` | Load environment variables for server components. |
| `react-icons` | Icons across cards, dashboards, and actions. |
| `sweetalert2` | Booking confirmations, auth prompts, CRUD alerts. |
| `eslint` / `eslint-config-next` | Linting rules for consistency. |
| `typescript` | Static typing across the project. |

## Folder Structure

```
eventbuddy-frontend/
├── app/
│   ├── admin/                # Admin dashboard route
│   ├── dashboard/            # User dashboard route
│   ├── events/[id]/          # Event details dynamic route
│   ├── components/           # Shared UI components
│   │   ├── layout/           # Navbar, footer, menus
│   │   └── dashboard/        # Admin & user dashboard widgets
│   ├── register/ signin/ signup/
│   └── page.tsx              # Landing page
├── public/                   # Static assets
├── README.md
├── package.json
├── tsconfig.json
└── ...other config files
```

## Project Flow

1. **Landing Page:** Fetches upcoming/previous events from `GET /events/*` endpoints and offers entry points to registration/login.
2. **Authentication:** Credentials saved to `localStorage` + cookies. Guards (`AdminGate`, `UserGate`) enforce access for `/admin` and `/dashboard`.
3. **Admin Workflow:** Admins create, edit, delete events via modal components and `EventManagementTable`, hitting `POST/PUT/DELETE /events` endpoints.
4. **User Experience:** Users browse event cards → open event details → select seats → book via `POST /events/:id/book`. SweetAlert handles confirmations/errors.
5. **My Bookings:** `/dashboard` uses `GET /events/my-bookings` to list confirmed reservations with options to refresh/extend future cancellation logic.

## Deployment Checklist

1. Run `npm run lint` and ensure there are no warnings/errors.
2. Run `npm run build` to verify the production bundle succeeds.
3. Provision the necessary environment variables (e.g., `BASE_URL`) on your hosting platform.
4. Confirm the backend endpoint is reachable from the deployed frontend.

