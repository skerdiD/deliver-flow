# DeliverFlow

**DeliverFlow** is a full-stack client delivery portal built with **Next.js**, **React**, **TypeScript**, **Supabase**, **Drizzle ORM**, **PostgreSQL**, **Tailwind CSS**, and **shadcn/ui**.

It helps freelancers and small agencies manage clients, projects, milestones, tasks, updates, files, payments, feedback, and approvals from one clean dashboard.

[Live Demo](https://deliver-flow.vercel.app/) | [Repository](https://github.com/skerdiD/deliver-flow)

---

## Demo Account

Use the demo credentials below to explore the platform.

```txt
Admin Email: demo@deliverflow.app
Password: Demo1234!
```

```txt
Client Email: client@deliverflow.app
Password: Demo1234!
```

The demo data is fake and may be reset at any time.

---

## Preview

Explore the deployed app: [deliver-flow.vercel.app](https://deliver-flow.vercel.app/)

### Landing Page

<img src="./public/landing-page.png" alt="DeliverFlow landing page" width="100%">

### Admin Dashboard

<img src="./public/admin-dashboard.png" alt="DeliverFlow admin dashboard" width="100%">

### Projects Management

<img src="./public/projects-management.png" alt="DeliverFlow projects management" width="100%">

### Client Portal

<img src="./public/client-dashboard.png" alt="DeliverFlow client dashboard" width="100%">

### Files, Payments, and Approvals

<img src="./public/files-management.png" alt="DeliverFlow files management" width="100%">
<img src="./public/payments-management.png" alt="DeliverFlow payments management" width="100%">
<img src="./public/approvals-management.png" alt="DeliverFlow approvals management" width="100%">

---

## Overview

Most freelance project workflows are scattered across email, messages, Google Drive, invoices, and task tools.

DeliverFlow was built to bring the full client delivery process into one organized portal.

Admins can manage clients, create projects, assign milestones and tasks, share updates, upload files, track manual payments, request approvals, and review client feedback.

Clients get a private portal where they can follow project progress, download files, check payments, submit feedback, and respond to approval requests.

The goal was to build more than a basic CRUD dashboard: DeliverFlow focuses on role-based access, project visibility, client collaboration, protected files, clean dashboards, manual payment tracking, and production-minded full-stack engineering.

---

## Business Value

DeliverFlow helps freelancers and small agencies look more professional by giving clients a clear place to follow delivery progress.

Instead of asking for updates across email or chat, clients can log in and see project status, tasks, files, payments, feedback, and approvals in one place.

For service providers, it creates a better delivery experience, reduces confusion, and keeps project history organized.

---

## Key Features

### Admin Dashboard

* View delivery overview
* Track active projects
* Monitor pending approvals
* Review client feedback
* See outstanding payments
* Follow recent project activity

### Client Management

* Create and manage clients
* Store company and contact details
* Connect clients to projects
* Track client status
* Manage client notes
* Support client portal access

### Project Management

* Create and edit projects
* Assign projects to clients
* Track project status
* Set deadlines
* Manage project progress
* Connect tasks, milestones, files, payments, approvals, and feedback

### Milestones and Tasks

* Create project milestones
* Add tasks to projects
* Assign task priority
* Track task status
* Set due dates
* Control client visibility
* Organize delivery work by project

### Project Updates

* Share progress updates
* Mark updates by type
* Keep clients informed
* Control which updates are visible to clients
* Maintain delivery communication history

### Files

* Upload project files
* Organize files by category
* Store files with Supabase Storage
* Keep files private
* Generate protected download access
* Control client file visibility

### Feedback

* Collect client feedback
* Review open feedback
* Respond as admin
* Mark feedback as reviewed or resolved
* Keep feedback connected to the right project and client

### Approvals

* Request client approval
* Connect approvals to projects and milestones
* Track pending approvals
* Store approval responses
* Support changes requested by clients
* Keep approval history organized

### Payments

* Create manual payment records
* Track unpaid, partial, paid, and overdue payments
* Set due dates
* Add payment notes
* Mark payments as paid when paid elsewhere
* Keep payment status visible to admin and client

### Client Portal

* Client-only dashboard
* View assigned projects
* Track project progress
* See visible milestones and tasks
* Download shared files
* Review payment status
* Submit feedback
* Respond to approval requests

### Security and Quality

* Supabase authentication
* Role-based admin and client access
* Protected app routes
* User-scoped project access
* Private file handling
* Server-side data access
* Arcjet protection
* Sentry monitoring
* TypeScript validation
* Unit and end-to-end testing

---

## Tech Stack

### Frontend

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Radix UI
* Lucide React
* Recharts
* TanStack Table
* React Hook Form
* Zod
* Sonner

### Backend and Database

* Next.js Server Actions
* Next.js API Routes
* Drizzle ORM
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase SSR
* postgres.js

### Security, Monitoring, and Tooling

* Arcjet
* Sentry
* Vitest
* Playwright
* ESLint
* Prettier
* GitHub Actions
* Vercel

---

## Architecture

```txt
Client UI
  |-- Next.js App Router / React / Tailwind / shadcn UI
  |-- Landing / Login / Admin Dashboard / Client Portal

Auth and Role Layer
  |-- Supabase Authentication
  |-- Admin and Client Roles
  |-- Protected Routes
  |-- Role-Based Redirects

Server and Data Layer
  |-- Server Actions / API Routes
  |-- Drizzle ORM / PostgreSQL
  |-- Clients / Projects / Tasks / Milestones

Delivery Workflow Layer
  |-- Updates / Files / Feedback / Approvals / Payments
  |-- Client Visibility Controls
  |-- Project Activity History

Security and Operations Layer
  |-- Supabase Storage / Signed File Access
  |-- Arcjet Protection
  |-- Sentry Monitoring
  |-- Vitest / Playwright / TypeScript Checks
```

DeliverFlow keeps client data project-scoped, protects dashboard routes by role, stores delivery records in PostgreSQL, and uses Supabase Storage for project files.

---

## Database Models

DeliverFlow includes database models for:

* Profiles
* Clients
* Client invitations
* Projects
* Project assignments
* Milestones
* Tasks
* Project updates
* Feedback
* Approvals
* Payments
* Project files
* Project activity
* Project view events

The schema is designed around a real delivery workflow where one client can be connected to projects, and each project can contain tasks, milestones, updates, files, payments, approvals, and feedback.

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

Create a `.env.local` file:

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

Open the app at:

```txt
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run test         # Run Vitest tests
npm run test:watch   # Run Vitest in watch mode
npm run test:auth    # Run auth/route protection tests
npm run test:e2e     # Run Playwright tests
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run Drizzle migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed demo data
npm run format       # Format code with Prettier
```

---

## Testing and Quality

* Vitest validates utilities and server-side logic
* Playwright validates core end-to-end behavior
* TypeScript catches type-level regressions
* ESLint keeps code quality consistent
* Prettier keeps formatting clean
* Sentry supports production monitoring

Run main checks:

```bash
npm run lint
npm run typecheck
npm run test
```

Run browser tests:

```bash
npm run test:e2e
```

---

## Author

Built by **skerdiD**.

GitHub: [@skerdiD](https://github.com/skerdiD)
