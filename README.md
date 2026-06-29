# DeliverFlow

**DeliverFlow** is a full-stack client delivery portal built with **Next.js**, **React**, **TypeScript**, **Supabase**, **Drizzle ORM**, **PostgreSQL**, **Tailwind CSS**, and **shadcn/ui**.

It helps freelancers and small agencies manage clients, projects, tasks, files, payments, feedback, and approvals from one clean dashboard.

[Live Demo](https://deliver-flow.vercel.app/) | [Repository](https://github.com/skerdiD/deliver-flow)

---

## Preview

Explore the deployed app: [deliver-flow.vercel.app](https://deliver-flow.vercel.app/)

### Landing Page

<img src="./public/landing-page.png" alt="DeliverFlow landing page" width="100%">

### Admin Dashboard

<img src="./public/admin-dashboard.png" alt="DeliverFlow admin dashboard" width="100%">

### Projects

<img src="./public/projects-management.png" alt="DeliverFlow projects management" width="100%">

### Client Portal

<img src="./public/client-dashboard.png" alt="DeliverFlow client dashboard" width="100%">

### Files, Payments, and Approvals

<img src="./public/files-management.png" alt="DeliverFlow files management" width="100%">
<img src="./public/payments-management.png" alt="DeliverFlow payments management" width="100%">
<img src="./public/approvals-management.png" alt="DeliverFlow approvals management" width="100%">

---

## Overview

Most freelance delivery workflows are scattered across email, chat, Google Drive, invoices, and task tools.

DeliverFlow brings the full client delivery process into one organized portal.

Admins can manage clients, create projects, track tasks, upload files, record payments, request approvals, and review feedback.

Clients get a private portal where they can follow progress, download files, check payments, submit feedback, and respond to approval requests.

The goal was to build more than a basic CRUD dashboard: DeliverFlow focuses on role-based access, client visibility, protected files, delivery workflow, and production-minded full-stack engineering.

---

## Business Value

DeliverFlow helps freelancers and agencies look more professional by giving clients one clear place to follow project delivery.

It reduces messy communication, keeps project history organized, and makes the delivery process easier to manage for both the service provider and the client.

---

## Key Features

### Admin Dashboard

* View delivery overview
* Track active projects
* Monitor pending approvals
* Review feedback
* See outstanding payments
* Follow recent activity

### Clients

* Create and manage clients
* Store contact details
* Connect clients to projects
* Manage client notes
* Support client portal access

### Projects

* Create and edit projects
* Assign projects to clients
* Track project status
* Set deadlines
* Manage progress
* Connect tasks, files, payments, feedback, and approvals

### Tasks

* Add project tasks
* Track task status
* Set priority
* Set due dates
* Control client visibility

### Files

* Upload project files
* Store files with Supabase Storage
* Keep files private
* Generate protected downloads
* Control client visibility

### Payments

* Create manual payment records
* Track unpaid, partial, paid, and overdue payments
* Mark payments as paid when paid elsewhere
* Add due dates and notes
* Show payment status to admin and client

### Feedback and Approvals

* Collect client feedback
* Review and resolve feedback
* Request client approval
* Track pending approvals
* Store approval responses
* Keep records connected to projects

### Client Portal

* Client-only dashboard
* View assigned projects
* Track progress
* Download shared files
* Review payment status
* Submit feedback
* Respond to approvals

### Security and Quality

* Supabase authentication
* Role-based admin and client access
* Protected routes
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

### Backend and Database

* Next.js Server Actions
* Next.js API Routes
* Drizzle ORM
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase SSR

### Tooling

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
  |-- Clients / Projects / Tasks / Files / Payments

Delivery Workflow Layer
  |-- Feedback / Approvals / Client Visibility
  |-- Project Activity / Protected File Access
```

DeliverFlow keeps client data project-scoped, protects dashboard routes by role, stores delivery records in PostgreSQL, and uses Supabase Storage for project files.

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
* Sentry supports production monitoring

Run checks:

```bash
npm run lint
npm run typecheck
npm run test
```

---

## Author

Built by **skerdiD**.

GitHub: [@skerdiD](https://github.com/skerdiD)
