# PRD — Volunteer Shift Scheduler
**Type:** Product Requirements Document (drop this into Cursor as project context)
**Repos:** `volunteer-shift-scheduler-client` (Next.js + shadcn/ui) · `Volunteer-Shift-Scheduler-api` (Flask + MySQL)
**Status:** Existing scaffold found in both repos — this PRD defines the delta needed to reach the full spec.

---

## 0. How to use this file in Cursor

1. Put a copy of this file in the root of **each** repo as `PRD.md`.
2. Open Cursor, open the repo, and reference it in chat with `@PRD.md` before asking Cursor to build a feature.
3. Build in the order listed in **Section 8 (Build Checklist)** — each step is small enough for one Cursor session and leaves the app runnable.
4. Do not let Cursor invent new folder names — the file/folder map in Section 5 and 6 mirrors what already exists in your repos so it edits in place instead of duplicating structure.

---

## 1. Current State vs. Target State (read this first)

Your two repos already have a real scaffold. Here is exactly what's reusable and what must change.

### Backend (`api`) — currently:
- `User` model: `id, email, password, role, created_at` — role is `admin | coordinator | volunteer`.
- `Event` model: `id, event_name, volunteers_needed, duration_hours, description, is_available, created_at` — this is actually a **shift-shaped** table (one row = one bookable slot), but has no date/time fields and no link to sign-ups.
- `Volunteer` model: a separate profile table (`full_name, email, phone, age...`) — **duplicates** what `User` should own. This is not in the spec and creates two sources of truth for "who is a volunteer."
- No sign-up/booking table at all → **no capacity enforcement, no cancel, no roster, no dashboard, no waitlist** exist yet.
- `roles_required()` middleware already works correctly for role-based route protection — reuse it as-is.

### Backend — target changes:
- Rename role `coordinator` → `organizer` everywhere (spec calls for **organizer, admin, volunteer**).
- Split the current `Event` table into two real tables: `Event` (the umbrella, e.g. "Beach Cleanup Weekend") and `Shift` (a bookable slot with date, start_time, end_time, capacity, role_description, belonging to an Event).
- Add a `SignUp` table (the join table between `User` and `Shift`) with status `confirmed | waitlisted | cancelled`. This table is the whole app — capacity checks, cancellation, rosters, dashboards, and hours-volunteered all read/write this table.
- Retire the standalone `Volunteer` table. A volunteer **is** a `User` with `role='volunteer'`; any extra profile fields (phone, etc.) move onto `User` as nullable columns if you want them, but they are optional, not required by the spec.

### Frontend (`client`) — currently:
- Has `app/admin/events`, `app/admin/volunteers`, `app/volunteers/events`, `app/volunteers/dashboard` route folders already scaffolded, plus a working `sections/event` data table and `sections/volunteer` CRUD forms, `lib/api-client.ts`, `providers/auth-provider.tsx`, `components/auth-guard.tsx`.
- These currently talk to the Event/Volunteer CRUD API above — **repurpose, don't discard**: the admin events data-table and forms become the basis for Shift management; the volunteer CRUD screens are replaced by sign-up/cancel actions since volunteers are just Users now.

### Frontend — target changes:
- `app/admin/events` → manage Events **and** their Shifts (nested: create Event, then add Shifts to it with date/time/capacity/role description).
- `app/admin/volunteers` → becomes **"Roster"**: per-shift list of who signed up (not a volunteer CRUD screen anymore).
- `app/volunteers/events` → "Browse Shifts": list open shifts, Sign Up button, disabled + "Full" badge when at capacity.
- `app/volunteers/dashboard` → Upcoming / Past shifts for the logged-in volunteer, with Cancel action on upcoming ones.
- `auth-guard.tsx` and `auth-provider.tsx` already support role gating — extend to redirect volunteers away from `/admin/*` (403 page), which is your role-based-access demo.

---

## 2. Roles & Permissions Matrix

| Action | Admin | Organizer | Volunteer |
|---|---|---|---|
| Create/edit/delete Events | ✅ | ✅ | ❌ |
| Create/edit/delete Shifts | ✅ | ✅ | ❌ |
| View roster for a shift | ✅ | ✅ | ❌ |
| Export roster CSV | ✅ | ✅ | ❌ |
| Browse open shifts | ✅ | ✅ | ✅ |
| Sign up for a shift | ❌* | ❌* | ✅ |
| Cancel own sign-up | — | — | ✅ (own only) |
| View own dashboard (upcoming/past) | — | — | ✅ |
| View own hours-volunteered summary | ✅ (any user) | ✅ (any user) | ✅ (self only) |

\* Admin/Organizer accounts are not expected to sign up as volunteers in this build; keep it simple by blocking `POST /shifts/:id/signup` for those roles at the API layer (`roles_required("volunteer")`), which doubles as a clean role-based-access demo point.

Backend enforcement = source of truth (`roles_required` decorator on every mutating route). Frontend hiding of admin nav links is UX only, never the actual security boundary — say this explicitly in your viva.

---

## 3. Database Schema (MySQL)

```sql
-- USERS (auth + all three roles)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','organizer','volunteer') NOT NULL DEFAULT 'volunteer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- EVENTS (umbrella container, created by admin/organizer)
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- SHIFTS (the actual bookable slot: date, time, capacity, role description)
CREATE TABLE shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL,
  role_description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- SIGNUPS (join table: the heart of the capacity/waitlist/roster/dashboard logic)
CREATE TABLE signups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shift_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('confirmed','waitlisted','cancelled') NOT NULL DEFAULT 'confirmed',
  signed_up_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelled_at DATETIME NULL,
  FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_active_signup (shift_id, user_id)
  -- prevents the same volunteer double-booking the same shift
);
```

**Derived values (compute, don't store):**
- `shift.spots_taken` = `COUNT(signups WHERE shift_id=? AND status='confirmed')`
- `shift.is_full` = `spots_taken >= capacity`
- `user.hours_volunteered` = `SUM(shift.duration_hours)` for all `signups` with `status='confirmed'` and `shift.shift_date < today` (i.e. only completed shifts count)

---

## 4. Backend API Contract (Flask)

Base URL: `/api`. Auth: JWT bearer token (already wired via `flask_jwt_extended`, keep as-is). Every response is JSON.

### Auth (existing, keep — just update `ALLOWED_ROLES`)
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | `{name, email, password, role}` — role must be one of `admin/organizer/volunteer` |
| POST | `/api/auth/login` | public | returns `{access_token, user}` |

### Events
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/events` | admin, organizer | `{title, description, location}` |
| GET | `/api/events` | any authenticated | list all events |
| GET | `/api/events/:id` | any authenticated | includes nested shifts |
| PUT | `/api/events/:id` | admin, organizer | |
| DELETE | `/api/events/:id` | admin, organizer | cascades to shifts + signups |

### Shifts
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/events/:event_id/shifts` | admin, organizer | `{shift_date, start_time, end_time, capacity, role_description}` |
| GET | `/api/shifts` | any authenticated | supports `?status=open` filter; each item includes `spots_taken`, `capacity`, `is_full` |
| GET | `/api/shifts/:id` | any authenticated | single shift detail |
| PUT | `/api/shifts/:id` | admin, organizer | |
| DELETE | `/api/shifts/:id` | admin, organizer | |
| GET | `/api/shifts/:id/roster` | admin, organizer | list of signed-up users + status (this is the "admin view of who signed up") |
| GET | `/api/shifts/:id/roster/export` | admin, organizer | **[stretch]** returns CSV file download |

### Sign-ups (volunteer actions — this is the signature logic)
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/shifts/:id/signup` | volunteer | See pseudocode below. Returns `409 Conflict` when full (or `201` with `status:"waitlisted"` if waitlist stretch is on). |
| DELETE | `/api/shifts/:id/signup` | volunteer (own only) | Cancels own sign-up; if waitlist stretch is on, auto-promotes next waitlisted volunteer to `confirmed`. |
| GET | `/api/users/me/shifts` | volunteer | Returns `{upcoming: [...], past: [...]}` for the dashboard. |
| GET | `/api/users/me/hours` | volunteer (self), admin/organizer (any `?user_id=`) | **[stretch]** total confirmed hours from completed shifts |

### Signature logic — capacity-safe sign-up (pseudocode for the controller)

This must be **race-condition safe**: if two volunteers click "Sign Up" on the last open spot at the same instant, only one should get in. Use a DB-level lock or a unique constraint + row lock, not just "count then insert" in two separate un-guarded steps.

```python
def sign_up_for_shift(shift_id, user_id):
    with db.session.begin():
        shift = Shift.query.with_for_update().get(shift_id)  # row lock
        if not shift:
            return {"error": "Shift not found"}, 404

        existing = Signup.query.filter_by(
            shift_id=shift_id, user_id=user_id
        ).filter(Signup.status != "cancelled").first()
        if existing:
            return {"error": "Already signed up for this shift"}, 409

        confirmed_count = Signup.query.filter_by(
            shift_id=shift_id, status="confirmed"
        ).count()

        if confirmed_count >= shift.capacity:
            # --- required behaviour: block the sign-up ---
            # --- stretch behaviour: waitlist instead of blocking ---
            signup = Signup(shift_id=shift_id, user_id=user_id, status="waitlisted")
            db.session.add(signup)
            db.session.commit()
            return {"message": "Shift is full — added to waitlist", "status": "waitlisted"}, 201
            # if NOT building the waitlist stretch goal, replace the above 5 lines with:
            # return {"error": "This shift is full"}, 409

        signup = Signup(shift_id=shift_id, user_id=user_id, status="confirmed")
        db.session.add(signup)
        db.session.commit()
        return {"message": "Signed up", "status": "confirmed"}, 201
```

### Cancellation + waitlist promotion pseudocode

```python
def cancel_signup(shift_id, user_id):
    with db.session.begin():
        signup = Signup.query.filter_by(
            shift_id=shift_id, user_id=user_id, status="confirmed"
        ).with_for_update().first()
        if not signup:
            return {"error": "No active sign-up found"}, 404

        signup.status = "cancelled"
        signup.cancelled_at = utc_now()

        # [stretch] promote the earliest waitlisted person, if any
        next_waiting = Signup.query.filter_by(
            shift_id=shift_id, status="waitlisted"
        ).order_by(Signup.signed_up_at.asc()).with_for_update().first()
        if next_waiting:
            next_waiting.status = "confirmed"
            # TODO: notify that user (out of scope for MVP — just reflect it in their dashboard)

        db.session.commit()
        return {"message": "Sign-up cancelled"}, 200
```

---

## 5. Backend File Map (map new logic onto your existing structure)

```
app/
  models/
    user_model.py        # EDIT: change role enum values, add optional profile fields
    event_model.py        # EDIT: strip shift-specific fields, keep title/description/location/created_by
    shift_model.py         # NEW: date/time/capacity/role_description, belongs to event
    signup_model.py         # NEW: shift_id, user_id, status, timestamps
    volunteer_model.py      # DELETE (superseded by user_model.py)
  controllers/
    auth_controller.py     # EDIT: update ALLOWED_ROLES to admin/organizer/volunteer
    event_controller.py     # EDIT: simplify to Event CRUD only
    shift_controller.py      # NEW: shift CRUD + roster + CSV export
    signup_controller.py      # NEW: sign_up_for_shift, cancel_signup, my_shifts, my_hours
    volunteer_controller.py    # DELETE
  routes/
    event_routes.py         # EDIT
    shift_routes.py          # NEW
    signup_routes.py          # NEW: nested under shift routes + /users/me/* routes
    volunteer_routes.py        # DELETE
  middleware.py              # KEEP as-is (roles_required already correct)
  utils.py                    # KEEP (utc_now already correct)
```

Migration note: since this is a course project, easiest path is `flask-migrate` (already in `requirements.txt`) — run `flask db migrate -m "shifts and signups"` after editing models, then `flask db upgrade`. If the DB is disposable, dropping and recreating it is fine too.

---

## 6. Frontend Page Map (Next.js App Router + shadcn/ui)

```
app/
  auth/login/page.tsx                # KEEP as-is
  auth/register/page.tsx              # EDIT: role select now admin/organizer/volunteer

  admin/
    events/page.tsx                   # EDIT: list Events (reuse existing data-table pattern)
    events/[id]/page.tsx               # NEW: Event detail — list its Shifts, "Add Shift" dialog
    shifts/[id]/roster/page.tsx         # NEW: table of signed-up volunteers, status badge, "Export CSV" button
    dashboard/page.tsx                  # EDIT: summary cards — total events, total shifts, shifts filling up soon

  volunteers/
    events/page.tsx                     # EDIT: browse OPEN shifts, "Sign Up" button, disabled+"Full" badge when at capacity
    dashboard/page.tsx                    # EDIT: two sections — Upcoming (with Cancel button), Past (read-only, shows hours)

components/
  auth-guard.tsx                          # EDIT: extend role check; unauthorized admin access → redirect to /403 or /volunteers/dashboard
  ui/badge.tsx                              # NEW (shadcn): for "Full" / "Waitlisted" / "Confirmed" status pills
sections/
  shift/                                     # NEW: mirror the existing sections/event pattern
    columns.tsx
    data-table.tsx (reuse sections/event/data-table.tsx generically if it's not event-specific)
    view/shift-list-view.tsx
    view/roster-view.tsx
services/
  event.ts                                   # EDIT: simplify to Event CRUD
  shift.ts                                     # NEW: CRUD + signup + cancel + roster + export
  volunteer.ts                                  # DELETE (replaced by shift.ts sign-up calls + existing auth service)
types/
  event.ts                                       # EDIT
  shift.ts                                         # NEW: Shift, Signup, RosterEntry types
```

Reuse note: `sections/event/data-table.tsx`, `data-table-pagination.tsx`, `data-table-toolbar.tsx`, `data-table-column-header.tsx` are generic TanStack-table wrappers already in your repo — don't rebuild them for shifts, just point a new `columns.tsx` at them.

---

## 7. Frontend UX Details for the Signature Logic

- **Shift list (volunteer view):** each shift card/row shows `spots_taken / capacity`. When `is_full === true`, the "Sign Up" button becomes disabled and shows a `Badge` reading "Full" (or "Join Waitlist" if the waitlist stretch is built).
- **Optimistic UI is not required** — since capacity is the whole point of the demo, do a normal request → response → refetch cycle so the 409 (or waitlist confirmation) is visibly returned from the server, not hidden by client-side prediction. This makes the viva demo clearer: click sign-up on the last spot from two browser tabs, show one succeeds and one is blocked/waitlisted.
- **Role-based access demo:** log in as a volunteer, manually navigate to `/admin/events` — `auth-guard.tsx` should redirect immediately. Then hit the API route directly (e.g. via curl/Postman) with the volunteer's token to show the **backend** also returns `403`, not just the frontend hiding a link.
- **Dashboard "Past" shifts:** compare `shift.shift_date` to today's date to bucket into upcoming/past; sort upcoming ascending, past descending.

---

## 8. Build Checklist (do it in this order in Cursor)

1. **Backend models** — write `shift_model.py`, `signup_model.py`; edit `user_model.py` role enum; edit `event_model.py`; delete `volunteer_model.py`. Run migration.
2. **Backend auth** — update `ALLOWED_ROLES` in `auth_controller.py` to `admin/organizer/volunteer`.
3. **Backend Event CRUD** — simplify `event_controller.py` + `event_routes.py`.
4. **Backend Shift CRUD** — new `shift_controller.py` + `shift_routes.py`, nested under `/api/events/:id/shifts` for create, flat `/api/shifts` for list/detail.
5. **Backend sign-up logic** — new `signup_controller.py` implementing the capacity-safe pseudocode in Section 4. Test with curl: fill a shift to capacity, confirm the next sign-up is blocked (or waitlisted).
6. **Backend roster + dashboard reads** — `GET /shifts/:id/roster`, `GET /users/me/shifts`.
7. **Frontend auth** — update register role select; confirm `auth-guard.tsx` blocks volunteer → `/admin/*`.
8. **Frontend admin: Events + Shifts** — event list/detail, "Add Shift" dialog with date/time/capacity/role description fields (use shadcn `Calendar` + `Popover`, both already in your `components/ui`).
9. **Frontend admin: Roster view** — table per shift of who's signed up, with status badges.
10. **Frontend volunteer: Browse + Sign Up** — shift list with capacity badge and disabled state at full.
11. **Frontend volunteer: Dashboard** — upcoming/past split, cancel button on upcoming.
12. **Stretch: waitlist** — add `waitlisted` branch server-side (already in pseudocode) + promotion on cancel; surface "Waitlisted" badge in volunteer dashboard.
13. **Stretch: CSV export** — `GET /api/shifts/:id/roster/export`, return `Content-Type: text/csv` using Python's `csv` module + `io.StringIO`; frontend just links/downloads it (there's already a `lib/download-file.ts` helper in the repo — reuse it).
14. **Stretch: hours-volunteered** — `GET /api/users/me/hours`, sum `shift.duration_hours` (add this column to `shift_model.py` if not deriving it from start/end time) for completed, confirmed signups; show as a stat card on the volunteer dashboard and on the admin roster/volunteer detail view.

---

## 9. Viva Demo Script (map straight to acceptance criteria)

1. Register/login as **admin**, create an Event, add a Shift with capacity = 2.
2. Register/login as **volunteer A**, sign up for the shift → confirmed.
3. Register/login as **volunteer B**, sign up → confirmed (now at capacity).
4. Register/login as **volunteer C**, attempt sign-up → **blocked with a clear message** (409, or waitlisted if that stretch goal is built) — *this is the core signature logic.*
5. As **volunteer B**, cancel the sign-up → if waitlist is built, show volunteer C auto-promoted to confirmed.
6. As **admin**, open the shift's roster → see the current confirmed list.
7. As **volunteer A**, try to navigate to `/admin/events` → blocked by the frontend guard; then show the same request hitting the API directly with volunteer A's token also returns `403` — *this is the role-based-access demo.*
8. (Stretch) Export the roster as CSV from the admin view.
9. (Stretch) Show volunteer A's hours-volunteered total updates after a shift's date has passed (can fake this by creating a past-dated shift and signing up for it directly in the DB/seed data for demo purposes).

---

## 10. Environment / Config Notes

**Backend `.env`** (matches your existing `app/config.py`):
```
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=volunteer_scheduler
JWT_SECRET_KEY=change-me
JWT_ACCESS_TOKEN_EXPIRES_HOURS=8
```

**Frontend**: confirm `lib/api-client.ts` base URL points at your local Flask port (default `5000`) and that CORS is enabled for it in `app/__init__.py` (add `flask-cors` init if not already wired — it's in `requirements.txt` but not seen registered in `app/__init__.py` currently; add `CORS(app)` there).

---

*End of PRD. Keep this file updated as you build — if you deviate from a decision here (e.g. you decide to build the waitlist stretch goal), update Section 4's pseudocode comment so Cursor doesn't regenerate the "blocked" behaviour by mistake.*
