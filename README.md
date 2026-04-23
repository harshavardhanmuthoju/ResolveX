# ResolveX

ResolveX is a department-specific complaint tracking web application for educational institutions. It now includes student registration, login-based access, role-specific workspaces, persisted user records, and live browser-state syncing for complaints and accounts.

## Included Files

- `index.html`: ResolveX single-page frontend
- `styles.css`: Responsive UI and dashboard styling
- `app.js`: Registration flow, login logic, persisted user records, complaint routing, HOD workflow, admin oversight, and live browser-state syncing
- `vercel.json`: Static Vercel deployment configuration
- `ResolveX_System_Specification.md`: Official system specification used for this build

## Demo Features

- Institutional ID format validation using `XXB81AXXXX`
- Official email generation with `@cvr.ac.in`
- Student registration with name, username, institutional ID, institute mail, password, and department
- Login page with role, username, password, and typed department validation
- Persisted user records in browser local storage
- Student complaint submission with branch name and description after login
- Department-isolated HOD dashboard
- Admin dashboard for credential review and complaint oversight
- Automatic `Not Seen -> In Progress` transition on complaint open
- Mandatory remarks for `Resolved` and `Rejected`
- Complaint history timeline with audit-style events
- Live state refresh from local storage across open sessions

## Deployment

This project is configured as a static site and can be deployed directly to Vercel.
