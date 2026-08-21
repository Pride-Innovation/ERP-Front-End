# Pride Bank ERP — working context

Two repos, worked on together:

- **Frontend** — `ERP-Front-End` (React 18 + TypeScript + MUI v5, CRA)
- **Backend** — `ERP-Back-End` (Spring Boot 3.2, Hibernate 6.3 + Envers, Flyway, MySQL)

Verify with `npx tsc --noEmit -p tsconfig.json`, `npx eslint src/... --ext .ts,.tsx`, and
`./mvnw.cmd -o test` (77 tests at time of writing, all green).

---

## Traps this codebase has already been bitten by

Read these before writing a query or a filter. Each one cost real debugging time and each is
represented by a regression test.

**1. JPQL dotted paths generate INNER JOINs.**
`a.branch.id = :id` silently inner-joins `branch`. Through a *nullable* association that filters
rows out in the FROM clause **before** any `OR` or `IS NULL` check is evaluated. This has now
caused four separate bugs: an empty branch-scoped movement listing, an asset location filter that
excluded every unassigned asset, an approver inbox that excluded every request routed to one named
person, and a national roll-up that dropped branchless assets. **Always use an explicit
`LEFT JOIN`,** and reuse the join rather than calling `join()` twice (a second call duplicates it
and inflates both rows and counts).

**2. Spring silently drops undeclared `@RequestParam`s.**
A frontend filter naming a parameter the endpoint does not declare looks like it works and returns
the unfiltered list. This is why the assets, requests and store filters were all partly inert.
**Check the controller signature before adding a filter key.**

**3. Pagination without a tie-break repeats and drops rows.**
Ordering on a single non-unique column leaves ties, and MySQL may order them differently per query,
so with OFFSET/LIMIT the same row appears on two pages and another on none. **Always append `id`
as a secondary sort.** `AssetSearchDao` and `RequestSearchDao` both do now.

**4. Never hardcode a status id.** Resolve by code (`statusIdsByCodes`, `statusService.findByStatusCode`).
Ids depend on seed order; two environments will disagree. Fixed in the dashboard queue and the
Rejected tab, both of which used literals.

**5. Envers `_aud` tables need every new column.** A new column on an `@Audited` entity without the
matching `_aud` column fails every write at runtime. Add both in the migration.

**6. Frontend services `catch (error) { return error }`** rather than throwing, so a failure arrives
as a value with no `status`. Treat anything that is not 200 as failed.

---

## Permission model

Effective permissions = `title.role.permissions ∪ additionalRoles[].permissions`. A user whose role
set contains `SUPER_ADMIN` bypasses every check.

**Two axes, deliberately separate:**

- **Route/action permissions** (`READ_ASSET`, `CREATE_REQUEST`, `APPROVE_STOCK_TAKE`, …) — may you
  open this page or perform this action.
- **Dashboard permissions** (`DASH_VIEW_*` subject, `DASH_SCOPE_*` scope) — what you see summarised
  and how far. Separate because `READ_ASSET` answers "may you open your own asset's detail page",
  and borrowing it to decide "how much of the estate do you see summarised" gave a branch officer
  the whole branch's totals.

**Scope is a ladder** (`SELF` < `BRANCH` < `ALL`); the widest granted wins. `DashboardScopeService`
is the single resolver — `effectiveScope()`, `resolveBranch()`, `resolveOwner()`, `canView()`.

**Migration safety:** a user holding none of an axis falls back to the pre-existing signals
(`VIEW_ALL_BRANCHES` → ALL; an org-read permission plus a duty station → BRANCH; else SELF). The
frontend `personas.ts` mirrors those rules line for line — **if they drift, the page renders a widget
whose endpoint then refuses it.**

Permissions are granted in **Settings → Roles**, in three labelled groups: *Action permissions*,
*Dashboard — what they see*, *Dashboard — how far they see*.

---

## Dashboard — done

One page, one widget registry, no dashboard-per-role. Widgets declare a `band` and a
`qualifies(capabilities)` predicate; empty bands do not render. Bands run **Needs Action → Mine →
Position → Trend → Records** for everyone, so the page has the same shape whoever is looking.

| Widget | Band | Needs |
|---|---|---|
| Awaiting My Decision | act | `DASH_VIEW_REQUESTS` |
| My Assets | mine | always |
| My Open Requests | mine | `DASH_VIEW_REQUESTS` |
| Assets by Category | position | `DASH_VIEW_ASSETS` |
| Asset Condition | position | `DASH_VIEW_ASSETS` |
| Assets Across All Branches | position | scope = ALL |
| Stocking Trend | trend | `DASH_VIEW_STOCK` |
| Request Fulfilment | trend | `DASH_VIEW_REQUESTS` |
| Recent Activity | records | assets or requests |

A **branch selector** appears only at ALL scope and moves the whole page at once (three widgets
wanted a branch filter; per-widget controls could disagree with each other).

**Request lifecycle, as specified:** "Awaiting My Decision" is exactly what the workflow routed to
you and disappears the moment you act. "My Open Requests" survives every approval tier, issuance and
the movement carrying the item, and leaves only on receipt acknowledgement. Open is defined by
*exclusion* of the two terminal states (`requestRejected`, `receiptAcknowledged`) so adding an
approval step never requires editing a list.

---

## Audit trail — done

`audit_event` (V17), append-only, deliberately **not** Envers-mirrored. `AuditService.record(...)`
joins the caller's transaction so the trail matches what committed; auth events use `REQUIRES_NEW` so
a *failed* login is still recorded. Envers stays underneath as the field-level forensic record — it
has no actor, no IP, and cannot see a login at all.

Instrumented: auth (incl. failed logins, auto-block, password reset), Movement, Consignment, Assets,
Disposal, Maintenance, Requests, Inventory, Users. **Ordinary page views are not audited** — they
would be ~95% of rows; exports are, because that is data leaving the building.

---

## Still open

**1. Permissions gating across the app** — the next piece of work. See
`docs/PERMISSIONS-PLAN.md`.

**2. `determineUserRole()` is deprecated, not gone.** It maps `title.role.name` onto hardcoded
labels, ignores `additionalRoles`, and knows nothing about duty station. Every caller now consults an
explicitly granted dashboard scope **first** and reaches the switch only for roles nobody has
configured. Once every role in an estate carries a scope, it and `legacyRequestersList` can be
deleted. Its dangerous `default -> emptyList()` (= *no restriction*, so unnamed roles saw everything)
is already closed.

**3. Asset Condition has no "Disposed" segment gap** — resolved; the projection now returns it and
the four counts partition the total exactly. Note the bug this surfaced: `assigned` was "any status
that is not in-maintenance and not require-update", which counted **written-off assets as In Use**.

**4. Store page Status filter** still offers Active/Disabled/Locked (user-account states). Needs the
same treatment as assets and requests once `GET /store`'s parameters are confirmed.

**5. `utils/pdf.js`** still serves the two DataGrid-based exporters. List pages now use
`utils/pdf/listPdf.ts` (reports-quality). Migrate the rest once the new PDF is confirmed good.
