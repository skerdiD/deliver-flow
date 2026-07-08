# DeliverFlow

**DeliverFlow** is a full-stack client delivery portal for freelancers and small agencies.

It helps service providers manage clients, projects, notes, milestones, files, payments, feedback, and approvals from one clean admin workspace, while clients get a private portal to follow project progress and respond to delivery requests.

Built with **Next.js**, **React**, **TypeScript**, **Supabase Auth**, **Supabase Postgres**, **Supabase Storage**, **Drizzle ORM**, **Tailwind CSS**, and **shadcn/ui**.

[Live Demo](https://deliver-flow.vercel.app) | [Repository](https://github.com/skerdiD/deliver-flow)

---

## Preview

DeliverFlow has two main sides:

- **Admin workspace** for managing client delivery
- **Client portal** for project updates, files, feedback, payments, and approvals

---

## Screenshots

### Admin dashboard

Main workspace overview for tracking delivery progress, approvals, feedback, and open payments.

<img src="./public/screenshots/admin-dashboard.png" alt="DeliverFlow admin dashboard" width="100%" />

### Client management

Manage client accounts, project access, delivery history, and client information.

<img src="./public/screenshots/admin-client-management.png" alt="DeliverFlow client management" width="100%" />

### Project management

Track client projects, progress, payment status, deadlines, and delivery ownership.

<img src="./public/screenshots/admin-project-management.png" alt="DeliverFlow project management" width="100%" />

### Client portal

Client-facing workspace for project updates, files, feedback, approvals, and payments.

<img src="./public/screenshots/client-portal.png" alt="DeliverFlow client portal" width="100%" />

### Client project details

Project-specific client view for progress, milestones, delivery details, and shared information.

<img src="./public/screenshots/client-project-detail.png" alt="DeliverFlow client project detail" width="100%" />

---

## Overview

Most freelance and agency delivery workflows are scattered across email, chat, Google Drive, invoices, spreadsheets, and task tools.

DeliverFlow brings the delivery process into one organized system.

Admins can manage clients, create projects, add notes, track milestones, upload files, record payments, collect feedback, and request approvals.

Clients get one private place to follow project progress, download shared files, check payment status, submit feedback, and respond to approval requests.

The goal was to build more than a basic CRUD app. DeliverFlow focuses on role-based access, project-scoped client visibility, private file handling, approval workflows, feedback review, and production-style full-stack engineering.

---

## Business Value

DeliverFlow helps freelancers and small agencies look more professional by giving clients one clear place to follow project delivery.

For clients, it reduces confusion around updates, files, payments, feedback, and approvals.

For service providers, it keeps delivery records organized, protects project scope, and creates a clearer workflow from project start to final handoff.

---

## Key Features

### Authentication and Roles

- Supabase email/password authentication
- Admin and client role support
- Protected admin and client route groups
- Role-based redirects after login
- Server-side role checks in protected layouts
- Invite-based client access flow

### Admin Workspace

- Delivery overview dashboard
- Active project tracking
- Open payment summary
- Pending approval visibility
- Recent feedback review
- Delivery items that need attention
- Clean SaaS-style sidebar navigation

### Clients and Projects

- Create and manage client accounts
- Store client contact details and notes
- Create and edit projects
- Assign projects to clients
- Track project status, progress, deadlines, and payments
- Connect notes, milestones, files, feedback, and approvals to projects

### Notes and Milestones

- Add project notes for delivery context and follow-ups
- Track milestone progress across client projects
- Mark milestones as completed or approved
- Connect milestones to client approval workflows
- Keep project decisions and delivery progress organized

### Files

- Upload project files
- Store files in Supabase Storage
- Keep project files private
- Generate protected signed downloads
- Restrict client access to assigned project files
- Show file metadata such as name, type, size, and upload date

### Payments

- Create manual payment records
- Track unpaid, partial, paid, and overdue payments
- Add due dates and payment notes
- Mark payments as paid when handled elsewhere
- Show payment status to both admin and assigned client

### Feedback and Approvals

- Clients can submit project feedback
- Admins can review and resolve feedback
- Admins can request client approvals
- Clients can approve or request changes
- Approval records stay connected to projects and milestones

### Client Portal

- Client-only dashboard
- View assigned projects
- Track project progress and milestones
- Download shared files
- Review payment status
- Submit feedback
- Respond to approval requests

### Security and Quality

- Protected server actions
- Server-side authorization checks
- Project-scoped client data access
- Private file handling with signed URLs
- Supabase RLS and storage policy hardening
- Zod validation for forms and mutations
- Arcjet protection
- Sentry monitoring support
- Unit and end-to-end testing
- Responsive SaaS-style interface

---

## Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- Recharts
- TanStack Table
- React Hook Form
- Zod

### Backend and Database

- Next.js Server Actions
- Next.js API Routes
- Supabase Auth
- Supabase Storage
- Supabase Postgres
- Drizzle ORM
- Typed database schema
- Project assignment permissions
- Protected file download flow

### Tooling

- Arcjet
- Sentry
- Vitest
- Playwright
- ESLint
- Prettier
- Drizzle Kit
- GitHub Actions
- Vercel

---

## Architecture

```txt
Client UI
  |-- Next.js App Router / React / Tailwind / shadcn UI
  |-- Login / Admin Workspace / Client Portal

Auth and Role Layer
  |-- Supabase Authentication
  |-- Admin and Client Roles
  |-- Protected Routes
  |-- Role-Based Redirects

Server Layer
  |-- Server Actions / API Routes
  |-- Zod Validation
  |-- Role Checks / Project Assignment Checks
  |-- Arcjet Protection / Sentry Logging

Database Layer
  |-- Supabase Postgres / Drizzle ORM
  |-- Profiles / Clients / Projects
  |-- Notes / Milestones / Files / Payments
  |-- Feedback / Approvals / Activity
```

Client access is controlled through project assignments, protected routes, and server-side permission checks.

Project files are stored in a private Supabase Storage bucket and downloaded through signed URLs only after authorization.

---

## Security Model

DeliverFlow uses server-side authorization with Supabase RLS and storage policy hardening.

- Middleware redirects users away from the wrong route group
- Admin and client layouts check user roles on the server
- Server Actions and Route Handlers re-check role or project assignment
- Client-facing queries are scoped to assigned projects
- Project files use a private Supabase Storage bucket
- Signed URLs are generated only after permission checks
- Service role keys and database URLs stay server-only
- `NEXT_PUBLIC_*` variables are limited to browser-safe public values

RLS and storage policies are included in:

```txt
supabase/migrations/0001_security_rls_storage.sql
supabase/migrations/0002_activity_invitation_rls.sql
```

Full security documentation:

```txt
docs/security.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/skerdiD/deliver-flow.git
cd deliver-flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=project-files
DATABASE_URL=
DIRECT_URL=
ARCJET_KEY=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

Keep `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, and `SENTRY_AUTH_TOKEN` server-only.

### 4. Run database setup

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Author

Built by **Skerdi**.

GitHub: [@skerdiD](https://github.com/skerdiD)