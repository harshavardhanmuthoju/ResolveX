# ResolveX Website

This workspace contains a frontend prototype for **ResolveX**, a department-wise complaint tracking system for educational institutions.

## What is included

- `index.html`: Main site structure and interactive demo layout
- `styles.css`: Full responsive styling
- `app.js`: Complaint workflow logic, student tracking, HOD filtering, and the "Read and Solve" trigger
- `vercel.json`: Basic static deployment configuration
- `ResolveX_Build_Context_Prompt.md`: Extended system and product context for future full-stack implementation

## Demo behavior

- Students can submit complaints
- Complaints are tracked in the student panel
- HODs can filter by department and status
- Opening a `Not Seen` complaint automatically marks it `In Progress`
- Complaints can be finalized as `Resolved` or `Rejected` with remarks
- Demo data persists in browser local storage

## Local usage

Open `index.html` in a browser to view the site.

## Vercel deployment

This frontend can be deployed as a static site on Vercel.

Suggested deployment settings:

- Framework preset: `Other`
- Root directory: current workspace
- Build command: leave empty
- Output directory: leave empty

## Important note

If you plan to deploy through Vercel, use a new token. Any token pasted into chat should be revoked and replaced before use.
