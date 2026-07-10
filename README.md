# 🏥 Clinic Management System

A full-stack, multi-tenant clinic management platform built with **Next.js 16**, **MongoDB (Mongoose)**, and **Clerk** for authentication. Designed to handle patient records, medical histories, prescriptions, pharmacy inventory, custom forms, and role-based staff access — all within a single, organization-scoped workspace.

---

## 📑 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Database Models](#database-models)
5. [Authentication & Authorization](#authentication--authorization)
6. [Key Modules](#key-modules)
7. [Environment Variables](#environment-variables)
8. [Getting Started](#getting-started)
9. [Scripts](#scripts)

---

## Tech Stack

| Layer               | Technology                                      |
| ------------------- | ----------------------------------------------- |
| Framework           | Next.js 16 (App Router)                         |
| Language            | TypeScript 5                                    |
| Database            | MongoDB Atlas via Mongoose 9                    |
| Auth Provider       | Clerk (`@clerk/nextjs`)                         |
| UI Components       | Shadcn UI (Radix UI primitives)                 |
| Styling             | Tailwind CSS v4                                 |
| PDF Generation      | `@react-pdf/renderer`                           |
| Charts              | Recharts                                        |
| Icons               | Lucide React                                    |
| Date Utilities      | `date-fns`                                      |
| Testing             | Vitest                                          |
| Internal Auth       | `jose` (HS256 JWT — dual-layer session system)  |

---

## Features

### 🧑‍⚕️ Patient Management
- Register, update, search, and delete patient records
- Server-side paginated and filtered patient table
- Custom registration sections — clinics can define their own intake form fields (text, number, textarea, select)
- Patient records are **organization-scoped** with support for cross-clinic sharing via `sharedWithOrgs`
- Medical history button opens a full git-style timeline of all encounters per patient
- Cascading delete: removing a patient also clears their `MedicalEncounter` and `Prescription` records

### 📋 Medical History (Git-Style Timeline)
- Visual tree layout with **center trunk**, **left-branch**, and **right-branch** lanes
- Encounter types: `one-time`, `followup`, `merge`
- Log, view, and **edit** encounters including clinical notes, complaints, and linked prescriptions
- Export a patient's full medical history to a **PDF report**
- **Bulk delete** all medical records for a patient (with Shadcn confirmation dialog)

### 💊 Prescription PDF
- Generate professional prescription PDFs per encounter
- Structured header: clinic logo, name, social links (left pane) + QR code (right pane)
- Dedicated footer block with clinic address, phone, and operating hours
- **Organization-level PDF settings** managed in Clinic Profile (no per-prescription config needed)
- Accordion-style preview UI showing Header, Footer, Patient Data, Encounter Details, and Medications
- Medication table with name, frequency, duration, relation-to-food (select), and instructions

### 🏪 Pharmacy Inventory
- Add, edit, and delete pharmacy stock items
- Track name, stock quantity, price, and tax per item
- Organization-scoped inventory

### 🗂️ Custom Forms
- Build custom intake form sections with drag-and-drop-style field editors
- Field types: `text`, `number`, `textarea`, `select`
- Toggle sections between **Live** and **Draft** status
- Fields are stored against each patient record under `customData`

### 🏢 Clinic Profile
- Organization name, logo, address, phone, and operating hours
- Social media links: Instagram, Facebook, X (Twitter), Website
- Prescription PDF layout defaults (stored org-wide via `prescriptionPdfSettings`)

### 🔐 Access Settings (RBAC)
- Create and manage **Roles** (e.g., Doctor, Receptionist, Billing)
- Assign sidebar tab permissions (`/patients`, `/forms`, `/pharmacy`, etc.)
- Assign functional permissions: `patients.read`, `patients.write`, `roles.manage`, `departments.manage`, `forms.manage`
- Manage **Departments** and map staff to them
- User access modes: `strict` | `shared` | `global`

### 📊 Dashboard
- KPI cards: Total Patients, New This Month, Next Appointment (placeholder)
- **Bar chart** of patient registration trends over recent months
- **Pie chart** of patient gender distribution
- Recent registrations table (last 5 patients)

---

## Project Structure

```
clinic-management/
├── public/                         # Static assets (favicon, images)
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Sign-in / Sign-up pages (Clerk hosted UI)
│   │   ├── (dashboard)/            # Protected dashboard route group
│   │   │   ├── layout.tsx          # Dashboard shell (Header + Sidebar + auth guard)
│   │   │   ├── page.tsx            # Dashboard overview (KPIs + charts + recent patients)
│   │   │   ├── patients/           # Patients list page
│   │   │   ├── clinic-profile/     # Clinic Profile settings page + components
│   │   │   ├── forms/              # Custom Forms dashboard page
│   │   │   ├── pharmacy/           # Pharmacy inventory page
│   │   │   └── settings/           # Access settings (roles, departments, users)
│   │   ├── api/
│   │   │   ├── users/              # Internal user sync endpoint
│   │   │   └── webhooks/           # Clerk webhook receiver (org/user sync)
│   │   ├── sync-workspace/         # Workspace sync helper route
│   │   ├── globals.css             # Global Tailwind CSS base styles
│   │   └── layout.tsx              # Root layout (ClerkProvider, ThemeProvider)
│   │
│   ├── components/
│   │   ├── ui/                     # 55 Shadcn UI primitives (Button, Dialog, Table, etc.)
│   │   ├── layout-guardian.tsx     # Client-side layout guard (injects JWT token to localStorage)
│   │   └── theme-provider.tsx      # next-themes dark/light mode wrapper
│   │
│   ├── constants/
│   │   ├── sidebar-tabs.ts         # Navigation tab definitions (id, label, icon)
│   │   ├── permissions.ts          # RBAC permission key constants
│   │   └── types/                  # Shared TypeScript type definitions
│   │
│   ├── database/
│   │   ├── db.ts                   # Mongoose connection with global caching
│   │   ├── utils.ts                # DB utility helpers
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── organization.model.ts
│   │       ├── membership.model.ts
│   │       ├── clinic-setting.model.ts
│   │       ├── patient.model.ts
│   │       ├── medical-history.model.ts   # MedicalEncounter + Prescription
│   │       ├── pharmacy.model.ts
│   │       ├── registration-section.model.ts
│   │       ├── role.model.ts
│   │       ├── department.model.ts
│   │       └── prescription-pdf.model.ts
│   │
│   ├── feature/                    # Feature-level components and logic
│   │   ├── patients/               # PatientsTable, PatientForm, hooks
│   │   ├── patient-profile/        # Patient detail sheet, Medical History modal, PDF export
│   │   ├── medical-history-pdf/    # Medical history PDF document component
│   │   ├── prescription-pdf/       # PrescriptionPdfDocument, PrescriptionExportDialog, preview
│   │   ├── forms/                  # CreateSectionModal, form field builder components
│   │   ├── pharmacy/               # Pharmacy UI and hooks
│   │   ├── settings/               # Role manager, department manager, user manager
│   │   └── side-layout/            # AppSidebar, Header, SidebarContext
│   │
│   ├── hooks/                      # Shared React hooks
│   │
│   └── lib/
│       ├── auth-token.ts           # Internal JWT creation, reading, and clearing (jose)
│       ├── utils.ts                # cn() utility (clsx + tailwind-merge)
│       └── actions/                # All Next.js Server Actions
│           ├── auth.actions.ts
│           ├── patient.actions.ts
│           ├── medical-history.actions.ts
│           ├── prescription-pdf.actions.ts
│           ├── clinic-setting.actions.ts
│           ├── pharmacy.actions.ts
│           ├── role.actions.ts
│           ├── department.actions.ts
│           ├── section.actions.ts
│           ├── access-settings.actions.ts
│           ├── admin.actions.ts
│           ├── clerk.actions.ts
│           └── organization.actions.ts
│
├── __tests__/                      # Vitest test suite
├── .env                            # Environment variables (see below)
├── components.json                 # Shadcn UI configuration
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind CSS v4 config
├── tsconfig.json                   # TypeScript config
└── vitest.config.ts                # Vitest test runner config
```

---

## Database Models

All models are stored in a **single MongoDB Atlas database** named `Clinic`. Every model is organization-scoped via `ownerOrgId` (a reference to the `Organization` collection).

### `User`
| Field              | Type              | Description                                     |
| ------------------ | ----------------- | ----------------------------------------------- |
| `clerkId`          | String (unique)   | Clerk user ID — vendor lock-in bridge            |
| `email`            | String (unique)   | User email                                      |
| `firstName`        | String            | First name                                      |
| `lastName`         | String            | Last name                                       |
| `imageUrl`         | String            | Profile avatar URL                              |
| `authProvider`     | `google` \| `credentials` | Auth method                            |
| `roleIds`          | ObjectId[]        | Assigned RBAC roles                             |
| `departmentIds`    | ObjectId[]        | Departments the user belongs to                 |
| `visibleTabs`      | String[]          | Allowed sidebar navigation paths               |
| `customPermissions`| String[]          | Extra granular action keys                     |
| `accessMode`       | `strict` \| `shared` \| `global` | Data visibility mode            |

### `Organization`
| Field         | Type            | Description                           |
| ------------- | --------------- | ------------------------------------- |
| `clerkOrgId`  | String (unique) | Clerk organization ID                 |
| `name`        | String          | Clinic display name                   |
| `slug`        | String (unique) | URL slug                              |
| `imageUrl`    | String          | Clinic logo URL                       |
| `ownerId`     | ObjectId → User | Primary admin                         |

### `Membership`
| Field                | Type            | Description                      |
| -------------------- | --------------- | -------------------------------- |
| `clerkMembershipId`  | String (unique) | Clerk membership reference       |
| `userId`             | ObjectId → User | Staff member                     |
| `orgId`              | ObjectId → Org  | Organisation                     |
| `role`               | String          | Clerk role string                |

### `ClinicSetting`
| Field                   | Type          | Description                                   |
| ----------------------- | ------------- | --------------------------------------------- |
| `ownerOrgId`            | ObjectId      | One setting document per org (unique)         |
| `address`               | String        | Clinic address                                |
| `phone`                 | String        | Contact number                                |
| `timings`               | Array         | `{ days, open, close }` clinic hours blocks  |
| `socialLinks`           | Object        | `instagram`, `facebook`, `x`, `website` URLs  |
| `prescriptionPdfSettings` | Mixed (JSON) | Org-wide default PDF section configuration   |

### `Patient`
| Field            | Type          | Description                                            |
| ---------------- | ------------- | ------------------------------------------------------ |
| `ownerOrgId`     | ObjectId      | Owning clinic org (indexed)                            |
| `sharedWithOrgs` | ObjectId[]    | Other orgs granted read access                         |
| `clerkOwnerOrgId`| String        | Clerk org ID (vendor-lock-in protection layer)         |
| `name`           | String        | Patient full name (indexed)                            |
| `email`          | String        | Email address                                          |
| `phone`          | String        | Phone number                                           |
| `dob`            | Date          | Date of birth                                          |
| `gender`         | `male` \| `female` \| `other` | Gender identity                   |
| `address`        | String        | Home address (optional)                                |
| `customSections` | Array         | Schema-defined custom form sections (see below)        |
| `customData`     | Mixed (JSON)  | Key-value store for all custom field responses         |

**Compound Indexes:** `{ ownerOrgId, name }`, `{ ownerOrgId, email }`, `{ ownerOrgId, phone }`, `{ ownerOrgId, createdAt }`

#### Custom Sections Structure
```
customSections: [
  {
    id: "sec_lifestyle",
    title: "Lifestyle",
    fields: [
      { id: "diet_type", label: "Diet Plan", type: "select", required: true, options: ["Veg", "Non-Veg"] }
    ]
  }
]
```

### `MedicalEncounter`
| Field          | Type                                    | Description                                 |
| -------------- | --------------------------------------- | ------------------------------------------- |
| `ownerOrgId`   | ObjectId                                | Org scope                                   |
| `patientId`    | ObjectId → Patient                      | Linked patient                              |
| `nodeId`       | String                                  | Unique node identifier in the git tree      |
| `date`         | String                                  | Encounter date (display string)             |
| `time`         | String                                  | Encounter time                              |
| `doctor`       | String                                  | Attending doctor name                       |
| `specialty`    | String                                  | Medical specialty                           |
| `complaint`    | String                                  | Primary complaint                           |
| `notes`        | String                                  | Clinical notes                              |
| `type`         | `one-time` \| `followup` \| `merge`     | Encounter type                              |
| `lane`         | `center-trunk` \| `left-branch` \| `right-branch` | Position in the visual tree    |
| `branchName`   | String                                  | Custom label for branches                   |
| `followupDate` | String                                  | Suggested next visit date                  |
| `parents`      | String[]                                | Parent `nodeId`s (DAG structure)            |

**Compound Index:** `{ ownerOrgId, patientId, createdAt }`

### `Prescription`
| Field           | Type                                          | Description                          |
| --------------- | --------------------------------------------- | ------------------------------------ |
| `patientId`     | ObjectId → Patient                            | Linked patient                       |
| `encounterId`   | ObjectId → MedicalEncounter                   | Linked encounter                     |
| `prescribedBy`  | String                                        | Prescribing doctor                   |
| `medications`   | Array                                         | List of `IMedicationRx` entries      |
| `status`        | `active` \| `completed` \| `cancelled` \| `filled` | Prescription status             |

#### Medication Entry Structure
```
medications: [
  { name: "Amoxicillin", frequency: "3x daily", duration: "5 days", instructions: "After Food" }
]
```

### `PharmacyItem`
| Field        | Type     | Description                  |
| ------------ | -------- | ---------------------------- |
| `ownerOrgId` | ObjectId | Org scope                    |
| `name`       | String   | Medicine / product name      |
| `stock`      | Number   | Current stock quantity (≥ 0) |
| `price`      | Number   | Unit price (≥ 0)             |
| `tax`        | Number   | Tax rate in % (≥ 0)          |

### `RegistrationSection`
| Field        | Type     | Description                                    |
| ------------ | -------- | ---------------------------------------------- |
| `ownerOrgId` | ObjectId | Org scope                                      |
| `title`      | String   | Section header                                 |
| `fields`     | Array    | `IRegistrationField[]` entries                 |
| `isActive`   | Boolean  | Live/Draft toggle                              |

### `Role`
| Field                | Type       | Description                                         |
| -------------------- | ---------- | --------------------------------------------------- |
| `ownerOrgId`         | ObjectId   | Org scope                                           |
| `name`               | String     | Role display name (unique per org)                  |
| `description`        | String     | Optional description                                |
| `allowedTabs`        | String[]   | Sidebar paths this role can access                  |
| `allowedPermissions` | String[]   | Functional permission keys granted to this role     |

---

## Authentication & Authorization

This application uses a **dual-layer authentication system**:

### Layer 1 — Clerk (External Identity Provider)
- Handles sign-in, sign-up, and organization management
- All pages under `(dashboard)` require a valid Clerk session
- Clerk webhooks (`/api/webhooks`) keep the internal MongoDB database in sync with Clerk events (user created, org created, membership added/removed)

### Layer 2 — Internal JWT Session (HS256 via `jose`)
- After Clerk authentication, an internal JWT is minted containing `{ userId, ownerOrgId }` and stored as an HTTP-only cookie (`clinic_session`, 7-day expiry)
- This token is also injected into `localStorage` as `clinic_jwt` by the `LayoutGuardian` component for use in client-side Server Action calls
- All Server Actions read the internal session from the cookie to scope database queries to the correct organization — **Clerk org ID is never used directly in DB operations**

### Role-Based Access Control (RBAC)
- Admins (`org:admin`) have unrestricted access to all sidebar tabs
- Non-admin users access only the tabs and permissions granted via their `Role` assignments
- Allowed tabs are written to `localStorage` (`clinic_allowed_tabs`) on login and re-read on each navigation

---

## Key Modules

### Server Actions (`src/lib/actions/`)

| Action File                    | Responsibility                                                 |
| ------------------------------ | -------------------------------------------------------------- |
| `auth.actions.ts`              | Mints and reads the internal JWT session token                 |
| `patient.actions.ts`           | CRUD for patients + server-side search/pagination + sharing    |
| `medical-history.actions.ts`   | Log, edit, fetch, bulk-delete encounters + prescriptions       |
| `prescription-pdf.actions.ts`  | Generates prescription data payloads for PDF rendering         |
| `clinic-setting.actions.ts`    | Read/write clinic address, timings, social links, PDF settings |
| `pharmacy.actions.ts`          | CRUD for pharmacy inventory items                              |
| `role.actions.ts`              | Create, update, assign, and delete org roles                   |
| `department.actions.ts`        | Manage departments and staff assignments                       |
| `section.actions.ts`           | Manage custom registration form sections                       |
| `access-settings.actions.ts`   | Fetch/update user tab access and permissions                   |
| `organization.actions.ts`      | Fetch org list for patient sharing feature                     |
| `clerk.actions.ts`             | Bridge Clerk user/org data to internal DB                      |
| `admin.actions.ts`             | Admin-level overrides and workspace sync utilities             |

### Sidebar Navigation

Defined in `src/constants/sidebar-tabs.ts`:

| Path             | Label            | Icon          |
| ---------------- | ---------------- | ------------- |
| `/`              | Dashboard        | LayoutGrid    |
| `/patients`      | Patients         | Users         |
| `/forms`         | Custom Forms     | FileSpreadsheet |
| `/pharmacy`      | Pharmacy         | Pill          |
| `/clinic-profile`| Clinic Profile   | Building2     |
| `/settings`      | Access Settings  | Settings      |

### Permission Constants (`src/constants/permissions.ts`)

```ts
PATIENTS_READ:       "patients.read"
PATIENTS_WRITE:      "patients.write"
ROLES_MANAGE:        "roles.manage"
DEPARTMENTS_MANAGE:  "departments.manage"
FORMS_MANAGE:        "forms.manage"
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Clerk Webhook (for syncing users/orgs to MongoDB)
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# MongoDB Atlas
MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/?appName=Cluster0

# Internal JWT Secret (min 32 characters — keep this secret!)
INTERNAL_JWT_SECRET=your_super_secure_minimum_32_character_secret_key
```

> **Note:** The `INTERNAL_JWT_SECRET` falls back to a hardcoded development key if not set. Always configure it for production.

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Clerk](https://clerk.com) account with an application and organization feature enabled
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (database name must be `Clinic`)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Fill in your actual keys in .env

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-Time Setup
1. Sign up via Clerk and create an **organization** (this represents your clinic)
2. The Clerk webhook will automatically create the corresponding `Organization` and `User` documents in MongoDB
3. Log in — you will be redirected to the Dashboard
4. Navigate to **Clinic Profile** to set your address, phone, timings, and social links
5. Navigate to **Access Settings** to create roles and invite staff members

---

## Scripts

| Script        | Command           | Description                        |
| ------------- | ----------------- | ---------------------------------- |
| Dev Server    | `npm run dev`     | Starts Next.js in development mode |
| Production    | `npm run build`   | Builds optimized production bundle |
| Start Prod    | `npm start`       | Runs production server             |
| Lint          | `npm run lint`    | ESLint check across codebase       |
| Tests         | `npm run test`    | Runs Vitest test suite             |

---

## Architecture Notes

- **Multi-tenancy** is enforced at the database query level. Every model has an `ownerOrgId` field and all server actions filter strictly by the authenticated user's `ownerOrgId`. No cross-organization data leakage is possible through the API layer.
- **Vendor lock-in protection**: The internal MongoDB `Organization` and `User` models mirror Clerk data but are structurally independent. If Clerk is ever replaced, only the authentication adapter layer needs to change.
- **Mongoose connection caching**: `src/database/db.ts` uses a global cache pattern to prevent new connections on every hot reload in development and on every serverless function invocation in production.
- **PDF generation**: Prescription and medical history PDFs are rendered client-side using `@react-pdf/renderer` with full control over header, footer, and content sections.
