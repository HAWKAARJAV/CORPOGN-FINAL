# CorpOgn

CorpOgn is a CSR and NGO collaboration platform built with Next.js, React, Tailwind CSS, and Supabase. It includes public marketing pages, corporate and NGO signup flows, role-aware dashboards, project connection APIs, and Playwright coverage for the main dashboard journeys.

## Features

- Public CorpOgn website pages for landing, platform, services, CSR strategy, CSR impact assessment, about, blog, contact, and privacy policy.
- Corporate onboarding with company slug generation and a dashboard for CSR analytics, campaign management, NGO management, budgets, ESG impact, approvals, AI insights, audit, employees, and support.
- NGO onboarding with role-based access for super admin, finance, compliance, operations, field coordination, reporting, and volunteer workflows.
- Supabase-backed registration, members, employees, messages, and project connection API routes.
- Database schema and seed scripts for local development and test data.
- Playwright end-to-end tests for NGO dashboards, role dashboards, and corporate dashboard behavior.

## How the Platform Works

CorpOgn has two main user journeys: corporates manage CSR programs and NGO partnerships, while NGOs manage compliance, team roles, project delivery, fund tracking, and impact reporting.

1. A corporate or NGO registers through the multi-step signup form.
2. Registration data is saved in Supabase and a Supabase Auth user is created.
3. The user signs in through the account-specific sign-in tab: Corporate, NGO Admin, or NGO Member.
4. The dashboard loads the correct organization by slug and verifies that the signed-in user belongs to that organization.
5. Corporates can discover verified NGOs and assign projects.
6. Assigned projects create `project_connections` records that are visible to both corporate and NGO dashboards.
7. NGOs post project updates, progress, milestones, utilization data, and reporting evidence.
8. Corporate dashboards display those NGO updates in the shared project workspace.

## Corporate Workflow

Corporate registration is split into five pages:

- Organization Basic Information: company name, logo, industry, CIN, GST, PAN, email, contact, location, size, turnover, CSR budget, and address.
- CSR Profile Information: CSR vision, focus areas, SDGs, preferred locations, policy document, current programs, and previous CSR experience.
- Compliance & Legal Details: authorized signatory, CSR registration number, incorporation certificate, CSR policy PDF, annual CSR report, audit reports, compliance contact, and ESG reporting requirement.
- Primary Admin Setup: admin name, designation, email, phone, password, department, role, and 2FA preference.
- ESG Preferences: ESG frameworks, net-zero goal year, sustainability goals, carbon tracking, and ESG KPI tracking.

After registration, the corporate account signs in and lands on `/corporate/[slug]/dashboard`.

New corporate accounts start with restricted access. The Support / Chat section is available first. When the corporate sends a support message through `/api/corporates/messages`, the account `access_status` is changed to `active`, unlocking the full dashboard. Corporate employee accounts can also access only the dashboard pages assigned to them.

## Corporate Dashboard

The corporate dashboard is organized around the sidebar in `lib/corporate.ts`:

- Dashboard: high-level CSR budget, active campaigns, pending approvals, compliance health, partner review, approvals, and reporting readiness.
- Master Analytics: portfolio-wide CSR spend, impact efficiency, NGO success rate, fund efficiency, ESG index, and risk score.
- Campaign Management: campaign lifecycle, campaign status, budgets, locations, progress, deadlines, and campaign overview tables.
- NGO Management: NGO discovery, verification filters, trust scores, focus areas, states, active project count, ratings, and project assignment.
- Project Workspace: shared corporate-NGO project view with project name, NGO name, budget, progress, milestone, latest NGO update, and document requests.
- Budget & Fund Tracking: CSR budget allocation, released funds, utilized funds, disbursement status, balances, and finance review queues.
- ESG & Impact: impact outcomes, ESG indicators, SDG alignment, beneficiary reach, and reporting visuals.
- Reports & Approvals: approval queues for funds, proposals, reports, compliance documents, and campaign actions.
- AI Insights: recommendations, risk flags, partner matching signals, and performance insights.
- Audit & Compliance: immutable audit logs, compliance health, document expiry, and governance tracking.
- Employees & Access: corporate employee accounts, allowed dashboard pages, active status, role table, and permissions matrix.
- Notifications: platform alerts and activity updates.
- Support / Chat: initial access channel and ongoing support conversation.

### Corporate to NGO Project Assignment

Corporate project assignment happens from NGO Management:

1. The dashboard loads registered verified or active NGOs from Supabase. If none are available, demo candidates are shown.
2. The corporate clicks the assignment action for an NGO candidate.
3. `/api/project-connections` creates a `project_connections` row with corporate ID, NGO ID, project name, focus area, budget, status, progress, milestone, latest update, and document requests.
4. The assigned NGO is updated with `has_project = true` and `access_status = active`.
5. The corporate Project Workspace immediately shows the connected NGO and project details.
6. The NGO dashboard unlocks project-specific sections such as My Projects, Project Chat, Fund Tracking, Milestone Reporting, Impact Reporting, and Utilization Certificate.

## NGO Workflow

NGO registration is split into seven pages:

- NGO Basic Information: NGO name, logo, type, registration number, PAN, GST, website, email, contact, location, establishment year, employee count, volunteer count, and address.
- NGO Profile & Focus Areas: mission, focus areas, SDGs, operational locations, beneficiary types, impacted beneficiaries, profile deck, previous CSR partnerships, and completed projects.
- Legal & Compliance Details: 12A, 80G, CSR-1, registration certificate, FCRA status, annual reports, audit reports, financial statements, NGO Darpan ID, and compliance contact.
- Bank & Financial Details: bank name, account holder, account number, IFSC, cancelled cheque, and UPI ID.
- Primary Admin Setup: admin name, designation, email, phone, password, department, role, and 2FA preference.
- Operational Capacity & Impact Monitoring: active projects, field staff, geographic coverage, monitoring capability, geo-tagged reporting, mobile reporting, and impact metrics.
- ESG & Sustainability: ESG reporting capability, carbon tracking, ESG framework familiarity, sustainability initiatives, and environmental programs.

After registration, NGO admins are sent to sign in. Once signed in, they land on `/ngo/[slug]/dashboard` as the NGO super admin.

## NGO Dashboard

The NGO dashboard supports super-admin access and role-specific member dashboards.

Super admin sections include:

- Command Center: organization status, verification status, trust score, project state, alerts, KPIs, and quick actions.
- NGO Profile: organization profile data and editable profile workspace.
- Compliance Vault: legal documents, mandatory compliance uploads, audit reports, and verification evidence.
- Trust Score: trust score health based on verification progress, document completeness, and credibility signals.
- AI Proposal Reviewer: proposal quality review and recommendations before corporate submission.
- Opportunities: corporate CSR opportunities, locked until verification.
- Corporate Funders: corporate funding pipeline, locked until verification.
- Proposals: proposal creation and tracking, locked until verification.
- Corporate Partnerships: partner relationship overview.
- My Projects: active CSR project delivery view, unlocked after project assignment.
- Project Chat: shared communication area for active projects.
- Fund Tracking: tranche releases, utilization, remaining balance, and financial tracking.
- Milestone Reporting: milestone progress, evidence, and delivery checkpoints.
- Impact Reporting: beneficiary outcomes, impact metrics, and reporting summaries.
- Utilization Certificate: utilization certificate preparation and submission evidence.
- Reports: generated NGO reports and reporting history.
- Audit Logs: timestamped account activity and compliance trail.
- Team Management / Role Assignment: create NGO member accounts and assign role-specific dashboards.
- Settings: organization and account controls.

## NGO Roles and Permissions

NGO super admins can create role-based member accounts from Role Assignment. The API route `/api/ngos/members` creates a Supabase Auth user with `account_type = ngo_member`, stores the member in `ngo_members`, and attaches the selected role in user metadata.

Supported NGO member roles:

- Finance Officer: Funds, Expenses, Invoices, Utilization Reports, Grant Tracking, and Finance Analytics. After project assignment, also sees Fund Tracking and Utilization Certificate.
- Compliance Officer: Compliance Vault, Legal Documents, NGO Verification, Audit Requests, and Compliance Workflow. After project assignment, also sees Utilization Certificate.
- Operations Manager: Projects, Milestones, Beneficiary Tracking, Task Assignment, Partnership Communication, and Report Drafts. After project assignment, also sees My Projects and Milestone Reporting.
- Field Coordinator: Assigned Projects, Beneficiary Forms, Field Updates, Media Uploads, and Attendance. After project assignment, also sees My Projects and Milestone Reporting.
- Reporting Executive: Impact Reports, Media Library, Analytics View, and Presentations. After project assignment, also sees Impact Reporting.
- Volunteer: Assigned Tasks, Event Participation, and Uploads.

Role routing is handled in `/ngo/[slug]/dashboard/page.tsx`. NGO admin users are treated as `super_admin`; NGO member users get their role from Supabase user metadata. Each role lands on a default section and only sees the sidebar items configured for that role.

## Unlock Rules

- Corporate dashboard: new corporate accounts are locked to Support / Chat until the first support message activates the account.
- Corporate employee dashboard: employees only see pages listed in their assigned `allowed_pages`.
- NGO opportunities: Opportunities, Corporate Funders, and Proposals require verified or active NGO status.
- NGO project workspace: My Projects, Project Chat, Fund Tracking, Milestone Reporting, Impact Reporting, and Utilization Certificate require an assigned project.
- NGO member roles: member dashboards are limited by role, then expanded only if the NGO has an active project.

## Shared Project Sync

Corporate and NGO dashboards share project state through `project_connections`.

- Corporate users create connections by assigning NGOs to projects.
- NGO users load their project connections from `/api/project-connections`.
- NGO users can update `latest_update` and `progress` through `PATCH /api/project-connections`.
- Corporate Project Workspace reads the same connection records, so NGO updates appear on the corporate side.
- The NGO dashboard also subscribes to Supabase realtime changes for `project_connections` and `ngos`, keeping project state, document requests, progress, trust score, access status, and unlock state current during a session.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Playwright
- ESLint

## Project Structure

```text
app/                    Next.js app routes, API routes, layouts, and dashboard UI
lib/                    Supabase clients and shared domain helpers
public/                 Static HTML exports, images, SVGs, and screenshots
scripts/                Seed and asset generation scripts
tests/                  Playwright end-to-end tests
playwright/             Playwright global setup and auth state output
supabase-schema.sql     Supabase database schema
ngo-schema.html         NGO schema/reference artifact
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Apply the database schema from `supabase-schema.sql` in your Supabase project before using registration, dashboard, or seed flows.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
```

Runs the Next.js development server.

```bash
npm run build
```

Builds the production app.

```bash
npm run start
```

Starts the production server after a successful build.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run seed:corporate-employees
```

Seeds corporate employee data using the configured Supabase environment.

Additional seed utilities are available in `scripts/`:

- `scripts/seed-ngo-test-data.mjs`
- `scripts/seed-project-connection.mjs`
- `scripts/generate-feature-svgs.mjs`

## Main Routes

- `/` - CorpOgn landing page
- `/corpogn-platform` - Platform overview
- `/services` - Services page
- `/csr-strategy` - CSR strategy page
- `/csr-impact-assessment` - Impact assessment page
- `/about` - About page
- `/blog` - Blog page
- `/contact` - Contact page
- `/privacy-policy` - Privacy policy
- `/signin` - Sign in
- `/signup` - Signup chooser
- `/signup/corporate` - Corporate registration
- `/signup/ngo` - NGO registration
- `/corporate/[slug]/dashboard` - Corporate dashboard
- `/ngo/[slug]/dashboard` - NGO dashboard

## API Routes

- `POST /api/corporates/register`
- `GET/POST /api/corporates/employees`
- `GET/POST /api/corporates/messages`
- `POST /api/ngos/register`
- `GET/POST /api/ngos/members`
- `GET/POST /api/project-connections`

Check each route file in `app/api/` for the exact request and response shape.

## Testing

Run Playwright tests with:

```bash
npx playwright test
```

The Playwright config starts or reuses the dev server at `http://localhost:3000`. Tests rely on Supabase-backed setup and auth state generated through `playwright/global-setup.ts`, so make sure `.env.local` and the database schema are in place first.

## Notes for Contributors

This project uses Next.js 16. Before changing framework-specific code, read the relevant local Next.js guide under `node_modules/next/dist/docs/`, because this version may differ from older Next.js conventions.
