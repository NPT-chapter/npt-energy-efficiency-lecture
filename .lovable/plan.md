# NPT Energy Efficiency Lecture Registration

## What gets built
- **Event page (/)**: header with NPT logo (links to npt-links.vercel.app) and NCTU university logo (links to NCTU Facebook), English/Arabic switch, light/dark toggle. Hero with title and "Register Now", event overview, speaker section with Dr. Zeinab Ibrahim's uploaded portrait, full bio, LinkedIn button, bottom call-to-action, footer. Date/time/venue left as configurable "to be announced" fields.
- **Registration page (/register)**: full name (3-4 parts, Arabic or English), student code with "I don't have a university code yet" checkbox, academic year (4 options), how you heard (3 options), Egyptian phone, email, privacy notice, loading state, no double submit.
- **Thank-you page (/thank-you)**: success message, name, large 8-character attendance code, working copy button, screenshot instruction, back button. Code kept only in memory (not URL, not storage); on refresh it points to the recovery option.
- **Recovery (/recover)**: student enters email + phone; generic response; code shown only if both match (rate limited).
- **Organizer area (/admin, sign-in required)**: totals, counts by year and source, search/filter, paginated table, CSV export, attendance check-in by code (valid / invalid / already used).
- Full Arabic translation with right-to-left layout; language and theme remembered.

## Design
Deep navy, petroleum blue, white, subtle green accent; distinctive display font with clean body font; subtle fade-in animations; mobile-first.

## Security
- Registrations table with row-level security on, no public read access at all.
- Registration, recovery, admin and check-in all run on the server; secret keys never reach the browser.
- Unique constraints on normalized email, phone and student code so simultaneous duplicates are impossible; duplicate message as specified, never revealing existing data.
- Codes from a secure random generator (uppercase + digits, no 0/O/1/I), unique with retry.
- Simple per-phone/email/IP rate limiting stored in the database.
- Organizers sign in with email/password; access controlled by a separate roles table checked on the server.

## Manual step for you
After you create your organizer account, I will grant it organizer access (or you tell me the email).

## Technical details
- Migration: `registrations` (fields from brief + `email_norm`, `phone_norm`, `student_code_norm` unique, `attendance_code` unique, `checked_in_at`, timestamps/trigger), `rate_limits`, `app_role` enum + `user_roles` + `has_role()`. Grants: service_role only on registrations/rate_limits; authenticated select on user_roles.
- Server functions (`createServerFn`) with zod validation; admin client loaded inside handlers; admin functions use `requireSupabaseAuth` + `has_role` check.
- Phone normalization to `+20XXXXXXXXXX` (accepts 01x, 201x, +201x); email lowercased/trimmed.
- Logos and portrait uploaded as CDN assets; NPT logo also as favicon.
- i18n via a small context with EN/AR dictionaries; `dir` and `dark` class on `<html>`, persisted in localStorage with no-flash script.
- Tests for phone/name validation, code format, and duplicate rules.
