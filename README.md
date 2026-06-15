# Nursing Computer Prep

A production-ready, frontend-only educational platform for nursing students preparing for computer science exams. Built with React 19, TypeScript, Vite 7, Tailwind CSS 4, Wouter, and Supabase (Auth + PostgreSQL + Storage).

---

## Project Overview

This application provides:

- **Structured lessons** with objectives, examples, practical tasks, and external video links
- **Interactive exams** with multiple-choice and true/false questions
- **Student dashboard** with progress tracking and exam history
- **Per-lesson certificates** (PDF) for students scoring 70% or higher
- **Admin panel** (`/admin`) for full CRUD on lessons, questions, images, and student results

The app is **frontend-only** — all data persistence runs through Supabase with Row Level Security (RLS).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 7 |
| Routing | Wouter |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Forms | React Hook Form, Zod |
| PDF | jsPDF |
| UI Components | shadcn/ui (Radix) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <repository-url>
cd nursing-computer-prep
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in **Supabase Dashboard → Project Settings → API**.

### 3. Database setup

Open **Supabase SQL Editor** and run the full schema:

```
supabase/schema.sql
```

This creates all tables, triggers, helper functions, and RLS policies.

### 4. Storage setup

1. Go to **Storage** in the Supabase Dashboard
2. Create a bucket named `lesson-images`
3. Enable **Public bucket**
4. Run these storage policies in the SQL Editor:

```sql
CREATE POLICY "Public read lesson images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-images');

CREATE POLICY "Admin upload lesson images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-images' AND is_admin());

CREATE POLICY "Admin delete lesson images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-images' AND is_admin());
```

### 5. Create an admin user

1. Go to **Authentication → Users → Add user** and create a user with email/password
2. In the SQL Editor, promote them to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

Or set `role: admin` in user metadata when creating via the Admin API.

### 6. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) API key |

---

## Database Schema

### `profiles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users` |
| `full_name` | TEXT | Display name |
| `role` | TEXT | `admin` or `student` |
| `created_at` | TIMESTAMPTZ | Auto-set |

### `lessons`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `title` | TEXT | Lesson title |
| `description` | TEXT | Short description |
| `content` | TEXT | Full lesson content |
| `week` | INTEGER | Curriculum week |
| `duration_minutes` | INTEGER | Estimated duration |
| `order_index` | INTEGER | Display order |
| `video_url` | TEXT | External video URL |
| `objectives` | JSONB | Array of strings |
| `examples` | JSONB | Array of example objects |
| `practical_tasks` | JSONB | Array of strings |
| `key_points` | JSONB | Array of strings |

### `lesson_images`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `lesson_id` | UUID (FK) | References `lessons` |
| `image_url` | TEXT | Public storage URL |
| `created_at` | TIMESTAMPTZ | Auto-set |

### `questions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `lesson_id` | UUID (FK) | References `lessons` |
| `text` | TEXT | Question text |
| `type` | TEXT | `mcq` or `truefalse` |
| `options` | JSONB | Array of option strings |
| `correct_answer` | TEXT | Correct answer value |
| `explanation` | TEXT | Optional explanation |
| `order_index` | INTEGER | Display order |

### `exam_results`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK) | References `profiles` |
| `lesson_id` | UUID (FK) | References `lessons` |
| `score` | INTEGER | Correct answers count |
| `total_questions` | INTEGER | Total questions |
| `percentage` | INTEGER | Score percentage |
| `answers` | JSONB | Detailed answer array |
| `created_at` | TIMESTAMPTZ | Auto-set |

### `certificates`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK) | References `profiles` |
| `lesson_id` | UUID (FK) | References `lessons` |
| `certificate_number` | TEXT (UNIQUE) | Format: `CERT-YYYY-XXXXX` |
| `score` | INTEGER | Exam percentage |
| `issued_at` | TIMESTAMPTZ | Auto-set |

**Constraint:** One certificate per user per lesson (`UNIQUE(user_id, lesson_id)`).

Certificate numbers are auto-generated by a database trigger on insert.

---

## Row Level Security (RLS)

All tables have RLS enabled. Summary:

| Table | Students | Admins |
|-------|----------|--------|
| `profiles` | Read/update own | Read all |
| `lessons` | Read | Full CRUD |
| `lesson_images` | Read | Insert/delete |
| `questions` | Read | Full CRUD |
| `exam_results` | Read/insert own | Read all |
| `certificates` | Read/insert own | Read all |
| Storage `lesson-images` | Read | Upload/delete |

The `is_admin()` SQL function checks `profiles.role = 'admin'` for the current `auth.uid()`.

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Vite**
4. Build command: `pnpm build`
5. Output directory: `dist`

### 3. Set environment variables

In Vercel project settings, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Deploy

Vercel will build and deploy automatically on push.

### 5. Supabase auth redirect

In Supabase **Authentication → URL Configuration**, add your Vercel domain to:

- Site URL
- Redirect URLs

---

## Production Checklist

- [ ] Run `supabase/schema.sql` in production Supabase project
- [ ] Create `lesson-images` storage bucket with policies
- [ ] Set environment variables in Vercel
- [ ] Create at least one admin user
- [ ] Add Vercel domain to Supabase auth URLs
- [ ] Seed lessons and questions via admin panel
- [ ] Verify RLS: student cannot access `/admin` routes (redirects to dashboard)
- [ ] Verify certificate generation requires 70%+ score
- [ ] Run `pnpm build` locally before deploying

---

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin panel reusable components
│   │   ├── AdminTable.tsx
│   │   ├── AdminForm.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ImageUploader.tsx
│   ├── ui/              # shadcn/ui components
│   ├── Navbar.tsx
│   └── ...
├── contexts/            # Theme context
├── hooks/               # useAuth and utilities
├── lib/                 # Supabase client, utils
├── pages/
│   ├── admin/           # Admin panel pages
│   │   ├── AdminDashboard.tsx
│   │   ├── ManageLessons.tsx
│   │   ├── ManageQuestions.tsx
│   │   └── ManageResults.tsx
│   ├── Home.tsx
│   ├── Lessons.tsx
│   ├── Exams.tsx
│   ├── Dashboard.tsx
│   ├── Result.tsx
│   ├── Certificate.tsx
│   └── Login.tsx
├── routes/
│   ├── ProtectedRoute.tsx   # Auth guard
│   └── AdminRoute.tsx       # Admin role guard
├── services/            # Supabase data layer
│   ├── lessonService.ts
│   ├── examService.ts
│   ├── profileService.ts
│   ├── certificateService.ts
│   ├── adminLessonService.ts
│   ├── adminQuestionService.ts
│   ├── adminResultService.ts
│   └── lessonImageService.ts
├── types/               # TypeScript interfaces
├── utils/
│   ├── format.ts
│   └── generateCertificatePDF.ts
├── App.tsx              # Router setup
└── main.tsx             # Entry point

supabase/
└── schema.sql           # Full database schema + RLS
```

---

## Scripts

```bash
pnpm dev       # Start dev server (port 3000)
pnpm build     # Production build
pnpm preview   # Preview production build
pnpm check     # TypeScript type check
```

---

## License

MIT
