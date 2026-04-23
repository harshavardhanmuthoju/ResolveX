# ResolveX System Specification

ResolveX is a decentralized, department-specific complaint tracking system for educational institutions. It is designed to remove administrative bottlenecks by routing student grievances directly to the relevant Head of Department.

## Core Principles

- Decentralized routing instead of central triage
- "Read and Solve" acknowledgment flow
- Department-level accountability
- Audit-safe complaint lifecycle tracking
- Low-resource deployment readiness

## System Vision

ResolveX operates on a direct department-routing model where student complaints move immediately to the concerned HOD dashboard. The system is optimized for modest hardware targets such as Intel i3 machines with 4GB RAM.

## Identity and Access Management

Every user is identified by a strict Institutional ID pattern:

- Format: `XXB81AXXXX`
- Prefix: two integers
- Fixed institutional code: `B81A`
- Suffix: four alphanumeric characters

Official email addresses follow this structure:

- `[Institutional_ID]@cvr.ac.in`

### Initial Admin/HOD Profiles

- `Raks` - System Admin / Lead Coordinator
- `CVR` - Department Head / Oversight

## Complaint Lifecycle

1. `Not Seen`
   - Default state on submission
   - Student-facing interpretation: pending

2. `In Progress`
   - Triggered automatically when an HOD opens complaint details
   - Treated as formal acknowledgment of responsibility

3. `Resolved`
   - Finalized manually by the HOD
   - Requires remarks

4. `Rejected`
   - Finalized manually by the HOD
   - Requires justification

## Student Portal

- Complaint submission form with category, department, and detailed description
- Automatic association with institutional ID and timestamp
- Complaint history view with real-time status and remarks

## HOD Dashboard

- Default department isolation
- Action list focused on pending departmental complaints
- Silent status transition from `Not Seen` to `In Progress` on detail view
- Mandatory remarks field before terminal resolution

## Backend and Data Integrity Rules

- Every status change must be logged to a separate audit table
- Server-side department validation is mandatory
- Oracle persistence should preserve complaint order using sequences
- Complaint history must remain available for audit even after final resolution

## Deployment Intent

This repository currently contains a static frontend prototype aligned with the ResolveX system vision. It is ready for lightweight deployment and can be evolved into a full React, Java, and Oracle implementation later.
