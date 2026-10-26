<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Registrations table has no client policies; all reads/writes go through server functions in src/lib/*.functions.ts using the admin client — keeps student data and codes private.
- Duplicate prevention relies on DB unique constraints (email, phone, upper(student_code)) — concurrency-safe without locks.
- Organizer access is checked server-side via has_role (admin/organizer in user_roles) — never trust the UI.
- Attendance code is passed to the thank-you page only via in-memory store (src/lib/code-store.ts) — never URL/storage.
- UI strings live in src/lib/i18n.tsx (en/ar dictionaries); add every new string to both.
- Registration open/closed state comes from REGISTRATION_CLOSED in src/lib/event.ts — the register page, hero/CTA buttons and the registerStudent guard all read it, so that flag alone reopens sign-ups.
