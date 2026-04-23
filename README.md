# ResolveX

ResolveX is a department-specific complaint tracking web application for educational institutions. This prototype demonstrates the decentralized routing model, institutional identity logic, and the "Read and Solve" workflow where an HOD acknowledges responsibility by opening a complaint.

## Included Files

- `index.html`: ResolveX single-page frontend
- `styles.css`: Responsive UI and dashboard styling
- `app.js`: Institutional ID validation, student submission flow, HOD workflow, and audit timeline interactions
- `vercel.json`: Static Vercel deployment configuration
- `ResolveX_System_Specification.md`: Official system specification used for this build

## Demo Features

- Institutional ID format validation using `XXB81AXXXX`
- Official email generation with `@cvr.ac.in`
- Student complaint submission with category, department, and description
- Department-isolated HOD dashboard
- Automatic `Not Seen -> In Progress` transition on complaint open
- Mandatory remarks for `Resolved` and `Rejected`
- Complaint history timeline with audit-style events

## Deployment

This project is configured as a static site and can be deployed directly to Vercel.
