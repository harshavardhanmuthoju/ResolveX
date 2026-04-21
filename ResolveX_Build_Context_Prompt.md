# ResolveX Build Context Prompt

You are a senior full-stack architect and product engineer. Design and build a production-ready web application named **ResolveX** for educational institutions.

## Product Summary

ResolveX is a **department-wise complaint tracking system** built to improve transparency, accountability, and response speed inside colleges and universities. The platform replaces centralized complaint handling with a **direct-to-department routing model**. Instead of sending complaints to one admin who must manually triage them, student complaints are routed immediately to the relevant **Head of Department (HOD)**.

The system must be optimized for **modest hardware environments** such as Intel i3 systems with 4GB RAM, so the application should prioritize simple architecture, efficient queries, lightweight frontend rendering, and low operational complexity.

## Core Philosophy

The app must reflect the principle of **Decentralized Accountability**:

- Every complaint is routed directly to the department responsible for it.
- HODs only see complaints assigned to their own department.
- Students only see complaints they personally submitted.
- The act of opening a complaint is treated as an acknowledgment of responsibility.
- Complaint history must be transparent and auditable.

## Primary Roles

### 1. Student

Students should be able to:

- Register and log in securely.
- Submit a complaint with title, description, and department selection.
- View all complaints they created.
- Track complaint progress in real time or near real time.
- Read full complaint history including timestamps and status transitions.

### 2. HOD

Heads of Department should be able to:

- Log in securely.
- Access a department-specific dashboard.
- View only complaints assigned to their own department.
- Filter complaints by status.
- Open complaint details.
- Automatically trigger status change from **Not Seen** to **In Progress** when a complaint is opened for the first time.
- Finalize complaints as **Resolved** or **Rejected**.
- Provide mandatory closing remarks when resolving or rejecting.
- Review full status history for accountability and reporting.

## Required Workflow

The complaint lifecycle must follow this exact four-stage workflow:

1. **Not Seen**
   - Default status when a student submits a complaint.

2. **In Progress**
   - Automatically triggered the first time the assigned HOD opens the complaint details.
   - This must create a timestamped acknowledgment trail.

3. **Resolved**
   - Set manually by the HOD.
   - Requires closing remarks.

4. **Rejected**
   - Set manually by the HOD.
   - Requires closing remarks.

This “Read and Solve” behavior is one of the core features of the platform and must be treated as a non-negotiable business rule.

## Functional Requirements

### Authentication and Access Control

- Use role-based authentication and authorization.
- Support at least two roles: `STUDENT` and `HOD`.
- Use secure session handling or JWT-based authentication.
- Every request from an HOD must be validated against the department mapped to that HOD.
- Students must never access complaints created by other students.
- HODs must never access complaints from other departments.

### Student Experience

- Clean registration and login flow.
- Complaint submission form with department selector.
- Dashboard listing submitted complaints in reverse chronological order.
- Detail page showing:
  - Title
  - Description
  - Department
  - Current status
  - Submission time
  - Closing remarks if available
  - Full status history

### HOD Experience

- Dashboard with summary cards:
  - Total complaints
  - Not Seen
  - In Progress
  - Resolved
  - Rejected
- Complaint list filtered to the HOD’s department.
- Ability to search and filter by status.
- Detail view that automatically marks a complaint as `In Progress` if it is still `Not Seen`.
- Action panel for `Resolve` and `Reject`.
- Mandatory remarks input before finalizing.

### Transparency and Auditability

- Students must be able to see all complaint status changes.
- Every status change must be logged as an immutable event.
- The platform should preserve the chronological order of complaints.
- Audit history should include:
  - Complaint ID
  - Old status
  - New status
  - Actor who caused the change
  - Timestamp
  - Remarks if applicable

## Technical Stack Requirements

Build the application using this stack:

- **Frontend:** HTML5, CSS3, React.js
- **Backend:** Java
- **Database:** Oracle Database
- **Development Tools:** Visual Studio Code and Oracle SQL Developer

## Architecture Expectations

### Frontend

Create a responsive role-based single-page application. The UI should include:

- Public auth pages
- Student portal
- HOD portal
- Protected routes by role
- Clear visual status indicators
- Accessible and mobile-friendly layouts

The React architecture should include:

- Authentication context/provider
- Route guards
- Shared layout components
- Student complaint submission and tracking views
- HOD dashboard, complaint list, and complaint detail flow
- State handling for filters, status updates, and optimistic or polling-based refresh

### Backend

Create a Java REST API that handles:

- Authentication
- User and role validation
- Complaint submission
- Department-scoped complaint retrieval
- Automatic read acknowledgment transition
- Resolve/reject updates with required remarks
- Complaint history retrieval

The backend must strictly enforce business rules and never rely on frontend checks alone.

### Database

Design an Oracle relational schema for:

- Departments
- Users
- Complaints
- Status audit log

The schema must:

- Preserve complaint order using a sequence or equivalent approach
- Store complaint descriptions safely
- Enforce valid complaint statuses
- Support fast department filtering
- Keep an append-only status history
- Use a trigger or equivalent database-level mechanism to record every status transition

## Required API Design Direction

The system should expose a RESTful API with endpoints conceptually covering:

- Registration and login
- Student complaint creation
- Student complaint listing
- HOD department-specific complaint listing
- Complaint detail retrieval
- Complaint view acknowledgment trigger
- Resolve complaint
- Reject complaint
- Complaint history retrieval

Each endpoint must clearly enforce user role and department ownership rules.

## UI / UX Direction

The product should feel professional, trustworthy, and simple to use in an academic environment.

Design goals:

- Clear dashboards rather than decorative complexity
- Strong emphasis on readability
- Distinct visual treatment for each status
- Fast-loading pages
- Minimal clicks for HOD actions
- Obvious visibility into what happened and when

Suggested visual tone:

- Clean academic or administrative look
- Light theme by default
- Calm, professional color palette
- Strong table/list readability
- Timeline-style history presentation

## Performance Expectations

The app is intended for low-resource institutional setups. Design accordingly:

- Keep backend logic efficient and straightforward
- Use indexed database access patterns
- Avoid unnecessary heavy client-side libraries
- Keep bundle size reasonable
- Prefer practical polling or lightweight refresh strategies over expensive real-time infrastructure if needed
- Paginate or filter large complaint sets efficiently

## Security Expectations

- Hash passwords securely
- Never expose unauthorized complaint data
- Enforce server-side authorization on every protected endpoint
- Prevent role escalation
- Validate and sanitize input
- Log meaningful security-relevant actions where appropriate

## Deliverables to Produce

Build the application and provide:

1. A complete frontend for students and HODs
2. A Java backend with REST endpoints
3. Oracle schema design and initialization scripts
4. Role-based authentication and authorization
5. Department-filtered complaint dashboard for HODs
6. Automatic `Not Seen -> In Progress` read trigger behavior
7. Complaint history and audit timeline
8. Clean deployment-ready project structure
9. Environment variable setup documentation
10. Deployment instructions suitable for Vercel for the frontend and an appropriate Java backend hosting workflow

## Important Product Differentiators

The final app must clearly communicate these competitive advantages:

- **Zero Bottleneck:** complaints go straight to the correct department without central triage.
- **Department Isolation:** HODs only manage issues relevant to their domain.
- **Accountability by Design:** opening a complaint is treated as acknowledgment.
- **Audit Readiness:** every status change is historically traceable.
- **Hardware Efficiency:** efficient filtering and lightweight architecture make the system viable on modest institutional hardware.

## Build Constraints

- Do not design this as a centralized admin-first system.
- Do not skip the automatic “Read and Solve” transition.
- Do not allow HODs to browse complaints outside their department.
- Do not allow status finalization without remarks.
- Do not over-engineer the infrastructure; keep it practical, maintainable, and suitable for small to mid-sized educational institutions.

## Final Outcome

Create a polished, end-to-end web application called **ResolveX** that demonstrates how department-wise complaint routing can outperform centralized grievance systems through direct accountability, transparent tracking, and low-cost deployment.
