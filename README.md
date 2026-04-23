# ResolveX

ResolveX is a department-specific complaint tracking web application for educational institutions. This prototype now includes a login-first experience with separate student, HOD, and admin workspaces, along with stored demo credentials and department-aware access.

## Included Files

- `index.html`: ResolveX single-page frontend
- `styles.css`: Responsive UI and dashboard styling
- `app.js`: Stored credentials, login flow, student submission, HOD workflow, admin oversight, and audit timeline interactions
- `vercel.json`: Static Vercel deployment configuration
- `ResolveX_System_Specification.md`: Official system specification used for this build

## Demo Features

- Institutional ID format validation using `XXB81AXXXX`
- Official email generation with `@cvr.ac.in`
- Login page with role, username, password, and department validation
- Stored demo credentials in browser local storage
- Student complaint submission with category, department, and description
- Department-isolated HOD dashboard
- Admin dashboard for credential review and complaint oversight
- Automatic `Not Seen -> In Progress` transition on complaint open
- Mandatory remarks for `Resolved` and `Rejected`
- Complaint history timeline with audit-style events

## Deployment

This project is configured as a static site and can be deployed directly to Vercel.
