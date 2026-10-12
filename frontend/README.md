# IEM Admission System — Frontend

React + Vite frontend for the IEM Admission System described in the project SRS.

## Current scope

The frontend includes:

- Student registration
- Student login
- Student dashboard
- Student profile
- Admission application form
- Document upload UI
- Application review/submission UI
- Application status tracking
- Submitted application view
- Admin login
- Admin dashboard
- Application search/filter
- Application details
- Document review UI
- Approve/reject workflow UI

The current version uses **mock data/local UI state**. The backend is intentionally not included yet.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Backend integration

The API base URL is controlled through:

```text
VITE_API_BASE_URL
```

Example:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

API calls are isolated under `src/services/`, so the Express backend can be connected later without rebuilding the page architecture.

## Suggested next step

Build the Node.js + Express backend and then replace the mock service functions with real API calls.
