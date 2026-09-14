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

Effective permissions =
`title.role.permissions ∪ additionalRoles[].permissions ∪ unit.roles[].permissions`. A user whose
role set contains `SUPER_ADMIN` bypasses every check. `User.getAuthorities()` and the frontend's
`usePermissions.collectPermissionNames` must stay identical — **if they drift, the page renders a
control whose endpoint then refuses it**, or hides one the user is entitled to with nothing on
screen to say why.

**Two axes, deliberately separate:**

- **Route/action permissions** (`READ_ASSET`, `CREATE_REQUEST`, `APPROVE_STOCK_TAKE`, …) — may you
  open this page or perform this action.
- **Dashboard permissions** (`DASH_VIEW_*` subject, `DASH_SCOPE_*` scope) — what you see summarised
  and how far. Separate because `READ_ASSET` answers "may you open your own asset's detail page",
  and borrowing it to decide "how much of the estate do you see summarised" gave a branch officer
  the whole branch's totals.

- **Cross-branch multipliers** (`VIEW_ALL_BRANCH_*`, `MANAGE_ALL_BRANCH_*` for assets, requests,
  movements, inventory) — they *widen* a permission the holder already has and grant nothing alone.
  `VIEW_ALL_BRANCH_ASSETS` does not open the assets page; `READ_ASSET` does that. This is what a
  unit confers.

**Scope is a ladder** (`SELF` < `BRANCH` < `ALL`); the widest granted wins.

Two resolvers, and they answer different questions:

| | Governs | Resolver |
|---|---|---|
| `DASH_SCOPE_*` | summarised figures on the dashboard | `DashboardScopeService` |
| multipliers | records and actions on module pages | `AccessScopeService` |

`AccessScopeService.scopeFor(subject, action)` resolves in order: **multiplier → dashboard ladder
capped at BRANCH → SELF**. It is the one place that answers "whose records may I touch, and where",
and it backs the asset listing, every asset write, and the request listing alike.

One rule worth knowing: **`DASH_SCOPE_ALL` widens VIEW to ALL but never MANAGE.** Without it a widget
counting every branch would link to a page showing a fraction of what it just counted. A write still
waits for the explicit `MANAGE_ALL_BRANCH_*`.

**All four subjects are wired.** Assets (listing, single read, every write), requests (`requestersList`),
movements (listing, detail read, dispatch / in-transit / receive / complete / cancel / attach), and
inventory — the last through `BranchScopeService`, which is now a **façade** over the resolver rather
than a second model. Seventeen call sites read naturally in its vocabulary, so it was kept and made to
delegate rather than rewritten.

Two shapes of check, because a record can sit in more than one place at once:

- `requireCanView` / `requireCanManage` — one branch. An asset.
- `requireCanViewAny` / `requireCanManageAny` — several. A movement has a source and a destination,
  either of which may be a store's location or a person's duty station; the caller is in reach if
  **any** end is theirs. That mirrors `MovementRepository#findForBranch` deliberately — a guard
  computing the branch differently from the listing would show someone a row they could not open.

**Disposal and repair** (`RepairMovementService`) live under `/movements` but act on an *asset* by id,
so they answer to the asset's branch. Disposal is the sharp one: it writes an asset off permanently.

**`createMovement` is deliberately unguarded.** Issuance, asset return and consignment fulfilment all
create movements for the system and legitimately span two branches — a Head Office issuer sending
stock to a branch is the ordinary case. The check belongs on the acts a *person* performs on an
existing movement.

**Dashboard endpoints must admit everyone the dashboard renders their widget for.** This has drifted
twice: the national asset roll-up named only `VIEW_ALL_BRANCHES` (so an Admin Unit officer, whose ALL
scope comes from `DASH_SCOPE_ALL` / `VIEW_ALL_BRANCH_ASSETS`, saw the widget and got a 403), and the
stock and request summaries named only their `READ_*` permissions (so granting the subject axis alone
— the entire point of it existing separately — rendered a widget nobody could load).
`DashboardWidgetEndpointTest` pins each endpoint against the narrowest authority the front end
qualifies on. **Add a case there whenever a widget's `qualifies` predicate changes.**

**Holding a permission is only half of what a control needs.** `usePermissions.has(UPDATE_ASSET)`
says the endpoint will admit you; `useAccessScope` says the record will. Both must pass, and asking
only the first is how a page comes to offer a button that lands on `/restricted-access` — the asset
detail page's Edit and Assign did exactly that, and the movement detail page's Dispatch / In Transit
/ Receive / Complete / Cancel checked business state and **no permission at all**.

`useAccessScope` mirrors `AccessScopeService` step for step, including the multi-ended
`canManageAnyOf` a movement needs. **If they drift the page misleads in one direction or hides an
entitled control in the other**, so change them together.

Still open: the assets *list* builds one row menu for the whole table, so it cannot scope per row.
Only bites someone holding `VIEW_ALL_BRANCH_ASSETS` without the MANAGE multiplier — the seeded unit
role grants both — and the click lands on `/restricted-access` rather than failing oddly. Fixing it
means carrying branch and holder ids on each row, which changes the row shape the column headers are
derived from.

**An asset's trail has its own permissions.** `READ_ASSIGNMENT_HISTORY` (who has held it, and when)
and `READ_REPAIR_HISTORY` (what failed, and when) were carved out of `READ_ASSET`, because seeing
what an asset *is* and seeing everyone who has *had* it are different disclosures — the second says
where a named member of staff was working. Both are **narrowing**: the asset's branch scope still
applies on top, in the service.

`AssetTrailPermissionSeeder` backfills every role that held `READ_ASSET` at the moment of the split,
**once**, using the permission row's own absence as the marker. It therefore runs *before*
`initializePermissions()` in `DataInitializer` — reverse the two and the marker is gone, nobody is
backfilled, and every role silently loses both tabs. `AssetTrailScopeTest` pins that.

The tabs on the asset detail page are keyed by name, not by array position: filtering a hidden tab
out used to shift every index after it, and the panel switched on the raw index.

**At SELF, the write check is looser than the read — deliberately.** The listing is a strict equality
on the holder, so an officer sees only what is in their hands. The write allows "your own record, or
one belonging to nobody at your branch", because a newly created asset has no holder and tightening
the shared rule would break `createAsset` for officers. The consequence: an officer holding
`UPDATE_ASSET` could edit an *unassigned* asset at their branch that they cannot see in their own
list. **This is a recorded decision, not an oversight** — officers are not meant to hold
`UPDATE_ASSET`; it belongs to Managers and BOMs, who are branch-scoped anyway. If you ever grant it
to an officer, that is the behaviour you get.

**Soft delete on assets** (`asset.deleted`, V20) is **not** disposal and the two never interact.
Disposal is a business event — end of life, written off through a movement, still counted in the
register. Delete is administrative — the record should not have existed. Separate columns, endpoints,
permissions and audit actions; an asset can be both. The row survives so its assignment and repair
history still point at something real, which is also why there is **no global `@SQLRestriction`**:
that would null out `AssignmentHistory.asset` and destroy the trail the flag exists to preserve. The
exclusion is written out at nine sites instead — eight JPQL queries plus `AssetSearchDao`. Deleted
reads as *not found*, never as forbidden.

**One-time seeds go through `OneTimeSeed`** (`seeder_state`, V19). Most seeders are reconciliations
and are safe to re-run; a few are migrations wearing a seeder's clothes — "on the day this ships,
give every role a default scope so nobody is narrowed". Those must run once. While the default scopes
re-applied on every startup, revoking `DASH_SCOPE_BRANCH` from `MANAGER` in Settings worked until the
next restart and then silently came back. **A test that asserts a one-time migration's *effect*
against live data is wrong** — an administrator revoking the permission is the feature working, and
such a test turns it into a build failure. Pin the marker, not the grants.

**Migration safety:** a user holding none of an axis falls back to the pre-existing signals
(`VIEW_ALL_BRANCHES` → ALL; an org-read permission plus a duty station → BRANCH; else SELF). The
frontend `personas.ts` mirrors those rules line for line — **if they drift, the page renders a widget
whose endpoint then refuses it.**

**Branch isolation is the default.** A record's branch is checked on read *and* write —
`AssetService.requireAssetInScope` guards update, reassign, send-to-store, the image actions and the
single-asset read; `createAsset` guards the branch it is created into. Before this, `UPDATE_ASSET`
admitted a branch officer to the endpoint and nothing afterwards asked whose asset it was: they could
not *find* another branch's asset through the listing, but they could edit it by id.

Permissions are granted in **Settings → Roles**, in three labelled groups: *Action permissions*,
*Dashboard — what they see*, *Dashboard — how far they see*. Roles are attached to **units** in
**Settings → Units** (shield icon, gated on `UPDATE_ROLE`) behind a two-step dialog that spells out
the consequences in plain English before saving. That call is `PUT /units/{id}/roles`, a
**replacement** — send the list you want, an empty list revokes everything. Granting and revoking are
the same operation deliberately: there is no second call anyone can forget. Audited as
`UNIT_ROLES_CHANGED`.

The dashboard hero names the unit when the unit is *why* the reach is what it is — "All branches &
Head Office · via Admin Unit". Nothing changes on a user's own record when their unit is granted a
role, so that label is the only place they can learn it.

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

## Movements page

**Row buttons now ask both questions, per row.** `MovementTable` mapped each lifecycle action to its
endpoint's permission — good — but resolved the answer **once for the whole table**, on the reasoning
that it "cannot change between rows". True of the permission, false of the **scope**: each movement
touches its own set of branches.

It mattered because `listMovements` resolves **VIEW** scope while every action endpoint guards with
`requireCanManageAny` — **MANAGE**. `DASH_SCOPE_ALL` widens VIEW to ALL and deliberately never
MANAGE, so a holder without `MANAGE_ALL_BRANCH_MOVEMENTS` saw every branch's movements and was
offered Dispatch, Receive, Complete and Cancel on all of them; the click came back 403. The table now
calls `canActOnAnyOf` — the same call the detail page makes, so the two screens cannot drift into
offering different buttons for the same movement.

Unlike the assets list, this table builds its actions **per row** already, so it could carry the
per-row rule. The assets list still cannot; that one remains open.

**`fetchAllMovements` had no non-200 branch** (trap #6) — a failed refresh left the previous table,
the five status tiles counted from it, and the record count all standing as if they were the new
result.

### Four faults found auditing the new register code

**1. Every date filter was three hours wrong.** The panel sent `toISOString()` — UTC with a trailing
`Z`. Spring binds that to a `LocalDateTime` **without complaining and discards the offset**, so the
instant is re-read as a wall-clock time. On a +03:00 server "today" searched from **9pm the previous
day**: last night's movements wrongly included, the last three hours of today wrongly excluded. No
error, no empty table — just a slightly wrong answer, which is why it had to be looked for. The rest
of the app already sends local `YYYY-MM-DDTHH:mm:ss`; the movement panel now does too.

**2. A branchless caller saw every branch.** `AccessScopeService.resolveBranch` returns `null` for two
opposite callers — one who may see every branch, and one with **no branch on record** — and
downstream null means *no restriction*. So an unconfigured account was handed the whole register.
`BranchScopeService#resolve` exists to close exactly this and says so in a comment; the movement
listing called the resolver directly and never got that protection. **Pre-existing** — the old
`listMovements` had `if (scoped == null) return findAll(pageable)` — and carried over when it was
rewritten. `MovementService#movementScope` now separates the two meanings and refuses the second.

**3. The approval inbox could be read for anyone.** `GET /movements/pending-approval/{approverId}`
took the approver from the path, and its own javadoc already flagged it. Larger than reading a
colleague's to-do list: it queries the repository directly with **no branch scoping**, so any holder
of `APPROVE_MOVEMENT` could name any approver and read DRAFT movements from any branch — around the
scope the listing applies. Now the caller's own, with `MANAGE_ALL_BRANCH_MOVEMENTS` as the override,
mirroring the fix already made to the approval *action*.

**4. `sortBy` was unvalidated and `pageSize` uncapped.** `sortBy` reaches `root.get(...)`, which
throws on a field the entity lacks — a stale bookmark or a typo took the register down with a 500.
Not injection (Criteria paths are not SQL), but a listing should not fall over because it was asked
for an ordering it does not have. Whitelisted, with an unknown column falling back to newest-first;
`pageSize` clamped to 5000, generous enough for the exports that legitimately need thousands.

### The register's exports were a fourth bespoke exporter — now shared

`utils/pdf.js` was deleted so every list page prints the same document, and the list pages reach
`exportListPdf` through `TableUtills`. **The movements page renders its own `MovementTable` rather
than `TableComponent`, so it never passed through there** and kept a hand-built exporter: a solid
teal header strip (the very thing `listPdf` replaced), no logo, no filter strip, no page numbers, and
its own CSV escaper and sheet naming beside it. The same data printed from Reports and from here came
out as visibly different documents.

All three formats now share one definition. `utils/exports/listSheet.ts` is new — the reports already
shared one grid between their two spreadsheet writers, the list pages had nothing, so any page
needing a sheet wrote its own. It takes the same `ListPdfColumn[]` as the PDF, so **a page defines
its columns once and gets all three formats**; a column added for the PDF cannot go missing from the
spreadsheet. CSV is encoded by the same library that writes the workbook rather than by a hand-rolled
escaper — quoting, embedded newlines and commas are exactly what a bespoke one gets wrong.

The PDF now carries the **active filters** as its strip. Without one, two exports taken minutes apart
under different filters are indistinguishable once saved, and an export is precisely the artefact
that outlives the screen that made it.

**Row height is `cellPadding`, and it lives in one place now.** autoTable sizes a row from its
content plus its padding, so the vertical figure is the whole of what makes a register feel airy or
cramped — it is 9pt top and bottom, up from the 5 it shipped with, which at 7.5pt type left the lines
almost touching their rules. The horizontal figure stays at 5 deliberately: widening it eats the text
width every column shares, and on a register running to eight or ten columns that buys whitespace by
making headings wrap.

`listTableStyles` / `listTableHeadStyles` are in `docKit` because the list exporter and the reports
exporter carried **byte-identical style objects** — deliberately, so the same data printed from
either came out looking like one document. Two identical literals stay identical only until somebody
adjusts one of them, which is what had already happened once before these documents were unified.

*Not* changed: `generateReleaseNote.ts` still builds its own document, correctly — it is a
single-document release note and already shares the GRN and dispatch-note furniture through
`docKit`. It was the register export alone that had drifted.

### The register is now filtered by the database — done

The page fetched **the first hundred movements once** and did everything else in the browser: eleven
filters, the sort, the paging, three exports and five status tiles. `MovementTable` paginated the
array it was handed, so there was no refetch and **movement #101 was unreachable** — and a movement
matching a filter exactly came back as "no results", which reads exactly like "there is no such
movement".

The most visible symptom was one screen carrying two kinds of number: the hero showed
`totalElements`, the **true** total, while the five tiles counted the **loaded** rows. Past a hundred
they stopped summing to the figure printed directly above them, and every tile under-reported
silently.

None of it could be wired to the server, because **`GET /movements` declared no filter parameters at
all** — only `pageSize` and `pageNumber` (trap #2 in its purest form: there was nothing to send to).

**`MovementSearchDao`** now does the work, following `AssetSearchDao`:

- **Every join is an explicit LEFT JOIN, created once.** All four of a movement's ends are nullable —
  measured on live data, **2 of 45 movements have no source store and 23 no recipient** — so dotted
  paths would have dropped them in the FROM clause. `findForBranch` was bitten by exactly this and
  returned *nothing at all* for every branch-scoped user. Joins are cached because a second `join()`
  on the same association duplicates it and inflates the count, which is what drives the page numbers.
- **The sort always ends in `id`**, so paging over a non-unique column cannot repeat or drop rows.
  The two finders it replaces had **no `ORDER BY` at all**.
- **Scope is stamped on by the service, never bound from the request** — a client-supplied scope is
  not a scope — and reproduces `findForBranch`'s four-ended rule exactly.

Two endpoints carry what a filter bar needs but a row listing cannot answer:

- **`/movements/status-counts`** — the tiles, counted over the whole matching set. Filtered by the
  panel but **not** by the status tab, or every other tab would read zero and the selected one the
  total.
- **`/movements/filter-options`** — the dropdown values, from the whole scoped register. They were
  derived from the loaded rows, so the panel could not offer a value it would have matched.
  Deliberately *not* narrowed by the active filters: picking a source would empty the destination
  list and the panel could never be widened again.

**Exports now refetch under the current filters** rather than writing out the rows on screen. A
partial export is the worst kind, because the file looks complete; where the 5000-row cap bites, the
user is told.

**A bug this shipped with, and the test gap that let it.** The join cache resolved nested paths
inside `computeIfAbsent`, whose mapping function re-entered the same `HashMap` to build the parent —
`ConcurrentModificationException`, every time. Every path the **branch-scope** predicate uses is
nested, so the register worked for anyone seeing all branches and returned a **500 to every branch
user**.

The suite was green because **all fourteen tests left `scopedBranchId` null**, which is what a
cross-branch caller resolves to — so the security-critical half of the predicate, and the only code
building a nested join, was never executed. Same vacuous pass as the supplier filters: green over an
unrun path. Five tests now set the field, and the first of them asserts only that a scoped search
*runs*.

**Whenever a query has a scoped and an unscoped path, test both.** The unscoped one is the easy
default in a test with no principal, and it is the one that does not need the check.

`MovementSearchDaoTest` covers it against live data, including that the tiles **partition** the total
and that every value the dropdowns offer is one the filter can actually match.

### The page called an inbox only approvers have

`/movement` fetched the approval-inbox count on every load, for everyone. That endpoint —
`GET /movements/pending-approval/{id}` — requires `APPROVE_MOVEMENT`, so on live data **six of the
twelve accounts that can read movements got a 403 on every page load**, for a chip they were never
going to be shown.

The endpoint was right. The page was not asking whether it had any business calling it: the only test
was `pendingCount > 0` on the *chip*, which is the wrong end — by then the request has already failed.
Gated on the permission now, so a non-approver simply never asks.

*The general shape, again:* a page must hold what its calls require, and the check belongs on the call
rather than on what the call renders.

### SELF now means something for a movement

It used to collapse. `movementScope()` returned the caller's branch for anything below ALL, so SELF
and BRANCH were the same query — an officer granted `READ_MOVEMENT` saw their whole branch's
register. `permits()` had the same hole from the other side: `canViewAny` passed branch ids only, so
at SELF it fell through to a branch comparison.

**A movement has no owner column**, which is why this needed defining rather than just wiring. It has
four *ends* and several person links, so "mine" is **a movement I am a party to**: I raised it
(`initiator`), it left my hands (`sourceUser`), it is coming to me (`recipientUser`), I signed for it
(`receivingOfficer`), or **it fulfils a request I raised** (`request.requester`). That last limb is
what lets an officer follow their own items, and it is the case that started this.

**Three places state that rule and they must agree** — `MovementSearchDao`'s SELF predicate decides
which rows come back, `MovementService.peoplePartyTo` decides whether the detail page opens, and
`useAccessScope.canManageAnyOf` decides whether a button is offered. `AccessScopeService` gained
`canViewAnyOf` / `requireCanViewAnyOf` / `requireCanManageAnyOf`, which take the people as well as the
branches; at SELF, **a record that names people and not me is not mine**, and falling through to the
branch check would widen SELF straight back into BRANCH. `MovementResponseDTO.RequestSummary` now
carries `requesterId` for the same reason — without it the front end could not mirror the fifth limb
and would hide a control the server allows.

Branch and person are **mutually exclusive**: applying the branch as well at SELF would filter out a
transfer coming to me from another branch, which is exactly the case the person rule exists to catch.

**`GET /movements/by-request/{id}` asks a different question now.** It required `READ_MOVEMENT`, which
most requesters do not hold — measured, **17 of 23 accounts could raise a request but not see it being
fulfilled**, so the panel on the request page answered 403 to the person who raised it. Granting them
`READ_MOVEMENT` would open the whole register, so the question is asked the other way round: *may you
read this request?* It reuses `requireReadableById`, which already admits the requester, a routed
approver and an issuer. A permission disjunction (`READ_REQUEST` or `READ_MOVEMENT`) stays in front of
it so the endpoint still has a rule of its own.

**Who this changed:** three Head Office officers at SELF scope narrow from all Head Office movements to
their own. BM and BOM at Gulu (BRANCH) and the Admin/Infra/Procurement accounts (ALL) are unaffected.

*A test note:* `MovementRouteAuthorizationTest` already tolerated one business refusal behind the
permission rule ("not attached to a branch") so that counting 403s could not pass with every
`@PreAuthorize` deleted. SELF introduced a second ("could not be identified"), and the helper had to
learn it — the distinction being kept is route-guard failure versus business rule, not the wording.

## Consignments

The same shape as the movements register, plus a scoping hole and a new trap.

**Nothing was scoped.** `ConsignmentService` contained no access check of any kind, so every
lifecycle action — dispatch, in-transit, arrive, receive, cancel, add/remove movement — worked on
**any** journey by id for anyone holding the permission. The single read was open too. The movement
actions had been closed against exactly this; consignments, which *carry those same movements*, had
not. Guarded now on **either end** — a journey runs between two branches and both are legitimately
involved — mirroring `findForBranch` and the multi-ended rule a movement gets. **Creation stays
unguarded**, as it does for movements: a Head Office issuer opening a journey to a branch is the
ordinary case.

**The listing returned the whole bank.** `branchId` came straight from the client, and with none
given it fell through to `findAll`. So a branch user read every journey by default, and any single
branch's by naming it. Scope is now server-resolved and the parameter is gone.

**A new trap: a declared parameter dropped by control flow.** The handler chose one finder by
ternary — `status != null ? findByStatus : branchId != null ? findForBranch : findAll` — so picking a
status **silently discarded the branch**. This is not trap #2: both parameters were declared,
documented and accepted, then thrown away by an `if`. It looks *more* correct from the outside than
an undeclared one, because the signature is right.

**The other eight filters ran in the browser** over 100 rows, with the tabs, their counts, the
dropdown options and three exports. All server-side now, via `ConsignmentSearchDao`. Two details
worth keeping:

- The date filter coalesces `dispatchDate` then `createDate`, matching the panel. Dating on the
  dispatch column alone drops every **draft**, which is often exactly what a date filter is looking
  for.
- `status` takes a **list**, because the page's "On the road" tab spans DISPATCHED and IN_TRANSIT. A
  single-valued parameter would have forced that tab to stay in the browser.
- "Overdue" is counted separately: it is not a status but a journey on the road past its date, so it
  cuts across two statuses and cannot come out of the status tally. `on-time` negates the whole
  condition rather than just the date, or every draft reports as late.

**The exporter was the fifth bespoke one** — now on `exportListPdf` + `listSheet`, like movements.

### Service tests need a bound request, not a SecurityContext

Adding the guard broke `ConsignmentLifecycleTest`, which pins real boundaries (marking a journey
arrived credits stock for every movement on it). Accepting `AccessDeniedException` in those
assertions would have made them pass whether or not the rules held, so instead they run as somebody
entitled.

**`CurrentUserService` resolves the caller by decoding the JWT on the bound HTTP request — never from
`SecurityContextHolder`.** Setting an `Authentication` does nothing, and does it *silently*. A test
that needs a principal must mint a token and bind a `MockHttpServletRequest`; `ConsignmentLifecycleTest`
now shows the pattern.

## Requests

The listing was the most hardened search in the codebase — every filter declared, a sort whitelist,
an `id` tie-break, explicit LEFT JOINs. Everything *around* it was open.

**Read, update and delete by id were unguarded.** `AccessScopeService` appeared exactly once in
`RequestService`, inside `requestersList()`, which feeds only the listing. So a request id was enough
to read, edit or soft-delete **any** branch's request. Same gap assets had before
`requireAssetInScope`, and the same fix.

**The read guard is wider than the write guard, deliberately.** An approval step routinely routes a
branch request to Head Office or to a unit, so a plain branch check on the read would refuse the very
people the workflow just asked to act — and the inbox would list rows that will not open. Reading is
therefore *in scope **or** routed to you*. Writing gets no such exception: being asked to approve
something is not a licence to edit or delete it. Approving is guarded separately, by
`WorkflowEngineService.requireActorIsRouted`.

**The listing's scope could be switched off from the client — the sharp one.** `RequestSearchDao`
skips the requester restriction whenever `currentApproverId` is set, which is *correct*: an approver
often sits above the requester and the subordinate rule would hide the work. But that parameter came
straight off the request, so `GET /requests?currentApproverId=<a colleague>` dropped the scope and
returned their whole inbox, from every branch. This is the movements approval-inbox fault in a second
module — `GET /movements/pending-approval/{approverId}` took the approver from the path — and is
closed the same way: the caller's own id, with `MANAGE_ALL_BRANCH_REQUESTS` as the logged override.
The unit half of that predicate was already server-derived.

**A refusal was rendering as an empty register.** `fetchAllRequests` ends in a blanket
`catch (Exception) → Page.empty()`, so a fault and "there are no requests" were the same screen —
and once the guards above existed, a boundary would have been silently swallowed by it. Both there
and on the by-id handlers (which turned everything into a 400 with the raw exception text),
`AccessDeniedException` now propagates.

**Four satellites sat outside `/requests/**`** and so were covered only by `authenticated()`. Each is
*about* a request, so each now answers to the request's own rule via `requireReadableById` rather
than inventing its own:

| | |
|---|---|
| `GET /workflow/step-logs/{id}` | the sharpest — `/workflow/**` was in no matcher at all, so any login could read who approved what, and when |
| `GET /request-report/{id}` | gated + scoped |
| `GET /issuance/{id}`, `GET /last-issued/{id}` | `REQUEST_ISSUANCE` is matched for **POST only**, so the reads fell through |
| `GET /movements/by-request/{id}` | gated on `READ_MOVEMENT` but unscoped; now narrowed per row |

**A dead security rule.** `POST /approvals` had *two* matchers — `APPROVE_REQUEST` then
`REJECT_REQUEST`. The first match wins, so the second never ran and a role holding only
`REJECT_REQUEST` **could not reject**: refused at the filter chain before the handler was consulted.
Latent while the seeded `MANAGER` holds both; live the moment a reject-only role is configured. Now
one `hasAnyAuthority`.

**`AccessScopeService.canViewAny` is new**, and `requireAny` delegates to it. A listing has to narrow
where a guard refuses, so both forms are needed — and if they drift, a row appears that will not
open, or one is hidden that would have.

### Requested By and Approver are pickers, not text boxes

Both were free text matched partially across first, last and other name — so two people called Okello
were one filter, and a misremembered spelling returned nothing with no hint why. The same fault the
assets page's *Assigned To* had, and fixed the same way: a person is chosen from the directory and the
id is sent.

All four tabs share `buildRequestColumnFilters`, so the change lands once. The directory behind both
is the same branch-scoped `GET /users` the assets picker uses, which matters — a picker offering
people the listing would never return reads as a filter that silently finds nothing.

**`approverId` is deliberately not `currentApproverId`.** They look like the same thing and are not:
`currentApproverId` means *"this is an approval inbox"* and makes `RequestSearchDao` **drop the
requester scope entirely** — correct there, because an approver often sits above the requester. Wiring
the dropdown to it would have turned a filter into a way of switching scoping off: pick any approver,
see every branch's requests. The new field narrows within the caller's scope instead.

The name parameters stay declared, so anything still sending one keeps working.

**Display labels are stripped at the wire, not earlier.** An `asyncSelect` carries `requesterId` and
`requesterId__label`; only the first belongs in the query. Stripped in `fetchAllRequests` rather than
in `toRequestParams`, because the export's filter strip is built from those same params and needs the
names. Sending the label would be harmless — Spring drops what it does not declare — which is exactly
why it should not be sent: an undeclared parameter that looks real is how a filter comes to appear
functional while doing nothing.

### The detail page stopped at approval

A request does not end when the last tier approves. It is **acknowledged** by Infra or Admin
(whichever the asset's category routes to), **issued** by Admin, the issuance is **approved**, and
finally the requester **acknowledges receipt**. The detail page offered Approve, Reject and Edit and
nothing else — so whoever's turn it was at any of those four stages opened the request, read it, and
found nothing to do. They had to go back to the list and use a row menu, which is backwards: the
detail page is where you read a request *before* acting on it.

**Driven by the workflow step, not by the status.** `ApprovalStep.stepType` already names exactly
these four stages — `REQUEST_APPROVAL`, `ACKNOWLEDGE_REQUEST`, `ISSUANCE`, `ACKNOWLEDGE_RECEIPT` — and
every one goes through `processStepAction`. Mapping statuses instead would be guesswork twice over:
there are a dozen of them, and for the acknowledgement and issuance steps the **client** sends the
target status id, so a status is a *consequence* of the action rather than a description of what is
due. The current step is the one step log still `PENDING`, and the page already loads the trail for
the approval certificate — so this costs no extra request.

**Approve Issuance is not a fifth stage.** `IssuanceApprovalRecordService` filters on
`StepType.ISSUANCE`, so issuing and signing off the issuance are two acts inside one step; the order
is issue *then* approve, because the approval loads an existing `Issuance`.

**Routing only, no "or I am the requester".** It is tempting to widen `ACKNOWLEDGE_RECEIPT` that way
since the requester is who it is for, but the engine refuses anyone it did not route to. Offering a
button on a guess is the failure the mirroring exists to prevent.

**No pending step means no actions** — a legacy request with no workflow instance shows none. Without
a workflow there is no way to know the stage, and a wrongly-offered button on a real request is worse
than sending someone to the list.

**A break no typecheck could see.** All three lifecycle modals resolve their target status by code
(`statusIdByCode`, correctly — ids depend on seed order) from `StatusesStore`. The **list** page loads
that catalogue for its tabs; the detail page never had, because until now it had no action needing a
status. Dropped in as-is, the lookup would have returned undefined and the acknowledgement posted a
null `statusId`. The page now loads it.

### The row menu now asks the same questions as the detail page — done

`actionRules.ts` had claimed in its own docstring to be "shared by the list and the detail page" and
was not. The list ran `resolveStateOptions`: **276 lines** of per-tab exclusion lists keyed on
`(tab, row status, am I the requester)`. Three things were wrong with that shape, and none could be
fixed by adding a branch:

- **It never asked whose turn it was.** Any holder of `APPROVE_REQUEST` was offered *Approve
  Request* on every pending row, including requests routed to another person at another tier. The
  engine refuses that (`requireActorIsRouted`), so the menu was promising a refusal.
- **It never asked what stage the request was at.** The whole Pending tab shared one branch that
  ignored the row entirely — `unitAcknowledged` matched no branch at all and fell to the default,
  which offered **Approve, Reject, Issue Items, Acknowledge Request and Acknowledge Receipt
  together** on 14 of the 50 live requests.
- **It failed open.** The default stripped delete, update and Approve Issuance and returned
  everything else, and the Rejected tab matched no branch in the first place — so it offered Update
  and Delete on other people's requests, which the backend refuses.

**The tab is deliberately not consulted any more.** Which list a request is being viewed in says
nothing about what may be done to it; the request's own stage and the viewer's relationship to it say
everything, and they are what the endpoints check. `filterRequestRowOptions` adapts a row back into
the shape `actionRules` reads, so there is one rule and one input.

**`RequestDTO.currentStepType` is what made it possible.** The row carried a status and a requester
id, which cannot answer "is it my turn" or "what is due". The stage is fetched for a whole page in
one query (`findCurrentStepTypes`) rather than per row, which is the shape that turns a listing into
N+1.

**Selected by the row, not by the tab — and that is not a stylistic choice.** The obvious key was
the tab's `module` name, and **`transportRequest/utills.tsx` also calls itself `"request"`**. Fleet
requisitions are a different entity, with a different endpoint and a status column holding status
*names* rather than request codes, so keying on the module would have run these rules over them and
**emptied that page's menu** — Update and Delete gone, by a name collision. Rows carry
`rowKind: 'assetRequest'` instead, so the rules apply exactly where the record is an asset request
and a page that is not one cannot be caught by accident.

**The menu's inputs ride on the table rows only, not on the export rows.** `determineRowsandColumns`
derives the exported columns from the keys of the first row, so a field added for the menu becomes a
column in the spreadsheet and the PDF. The table has no such problem — its columns come from
`getTableHeaders(rowData)`, a fixed shape. Hence two mappers, and a comment saying why.

**Who loses something:** somebody the workflow has not routed a request to now sees **View Details**
alone, on every tab. That is what the detail page already showed them, and what the endpoints already
enforced.

### One stage was wearing another's name — found by measuring

The sharpest thing this turned up, and it was already shipped in the detail page.

**Approving an issuance is not part of the `ISSUANCE` step.** `actionRules.canApproveIssuance`
required that step, on the reasoning that issuing and signing off the issuance are two acts inside
one. They are not: issuing calls `processStepAction`, which **advances the workflow**. The sign-off is
the *next* step, stored as a `REQUEST_APPROVAL` whose `approverSubject` is `ISSUER` and routed to the
**issuer's** manager.

So the condition could never hold. Measured on live data: every issued request had already moved past
`ISSUANCE`, and **Approve Issuance was offered nowhere at all**.

The other half is worse. That step reads as a plain `REQUEST_APPROVAL`, so both the menu and
`requireCurrentStepIs(REQUEST_APPROVAL)` accepted it as an ordinary approval — and the two acts post
to **different endpoints**. `POST /approvals` merely advances the step; `POST /approve-issuance`
creates the **fulfilment movement that actually sends the items**. Approving it as a request would
have recorded the request `issuanceApproved` with nothing on its way. The old menu's one-line comment
about `approverSubject=ISSUER` was right about this and was the only thing in the codebase that knew.

**Fixed by naming the stage.** `findCurrentStepTypes` projects `approverSubject` alongside
`stepType`, and `RequestService.stageOf` reports that combination as **`ISSUANCE_APPROVAL`** — a
reading of two fields, not a new kind of step, since the workflow editor still configures an approval
step with an issuer subject. `resolveStatusCode` already treated it as its own stage; now the
listings do too. `requireNotIssuanceApprovalStage` is the backend half, called by the approval service
for approvals **but not for rejections**: refusing an issuance is a real decision, `handleRejection`
is the only path that records it, and there is no reject endpoint beside `/approve-issuance` — so
blocking it would leave the stage with no way to say no.

*The general shape, one level finer than the previous entry:* there, two rules disagreed about which
stage a request was at. Here, **one stage wore another's name**, and every rule agreed with itself
while being wrong. An enum constant is not always the stage; check what else the code branches on
beside it.

**What the fifty live requests now offer** — each to the person or unit the workflow routed it to,
everyone else seeing View Details:

| Rows | Status | Stage | Menu |
|---:|---|---|---|
| 4 | `requestCreated` | `REQUEST_APPROVAL` | Approve, Reject |
| 1 | `requestApproved` | `REQUEST_APPROVAL` | Approve, Reject |
| 4 | `branchManagerApproved` | `ACKNOWLEDGE_REQUEST` | Acknowledge Request |
| 14 | `unitAcknowledged` | `ISSUANCE` | Issue Items |
| 1 | `issued` | `ISSUANCE_APPROVAL` | Approve Issuance, Reject |
| 10 | `issued` / `issuanceApproved` | `ACKNOWLEDGE_RECEIPT` | Acknowledge Receipt |
| 16 | `receiptAcknowledged` | *(none)* | — |

Exactly one action per row, where the old menu offered up to five.

### A request with a unit read as having nobody

A workflow step can be routed to a **unit** rather than to a person — an acknowledgement goes to Admin
or to Infra depending on the asset's category, and such a step sets `currentUnit` with no
`currentApprover` at all. Every screen read only the person, so a request genuinely sitting with Admin
displayed as **"Unassigned"**, **"Not specified"** and **"Not yet assigned to an approver"** — three
phrasings of the same wrong answer, on the detail hero, the request tabs, the dashboard queue and
"My Open Requests".

Wrong rather than merely unhelpful: the request **is** assigned, somebody in that unit has to act, and
saying nobody has it invites the reader to conclude the workflow has stalled — the opposite of the
truth, with nowhere to chase. On the printed approval certificate the "CURRENTLY WITH" panel said
"No outstanding approver", which is the panel's whole purpose.

**Seven places built that string by hand** from `firstName + lastName`, and none could have got the
unit right. They now share `requestApproverLabel` — person, else unit, else null. Its parameter is
**structural** (`IHasApprover`) rather than `IRequest`, because the action modals carry a deliberately
narrow local shape and a cast at the call site would have been the worse trade.

**No backend change was needed:** `convertToRequestDTOList` already carries `currentUnit` — added when
the unit-routed Approve button was fixed — and both dashboard endpoints use it, as does the detail
mapping. The data was there; only the rendering was blind to it.

*Not merged with `personName`*, which also renders the **requester**, where a unit is never the answer.
That helper is declared three times across the dashboard and the request pages and has already
drifted (one returns `string`, another `string | null`); one dead copy went with this change, the
other two remain.

### Two notions of "where are we" — and a wrong-stage action that would have advanced the workflow

A regression from the change above, and the sharpest kind: it looked like a UI annoyance and was a
data-integrity bug.

Request #36 sat at status **Unit Acknowledged** with its pending step at **ISSUANCE**, and the page
offered **Approve, Issue Items and Reject** together. `unitAcknowledged` lives in
`WORKFLOW_APPROVAL_CODES` → `PENDING_REQUEST_CODES` → `APPROVABLE_REQUEST_CODES`, so
`isAwaitingDecision` stayed true long after the approval stage had passed. **The four new actions were
gated on the workflow step; Approve and Reject were left gated on status** — two notions of "where are
we" in one file, disagreeing the moment they diverge, which is routine.

**Pressing Approve there would not have failed.** `processStepAction` resolves whatever step is
*current* and applies the action it is handed, without checking the two suit each other — so it would
have marked the **issuance** step approved and advanced the workflow, recording the request as issued
when nothing had been.

Approve and Reject now require `currentStepType === 'REQUEST_APPROVAL'`, which makes all six actions
mutually exclusive by construction. That also repairs an axis confusion: `isRoutedToActor` admits
`MANAGE_ALL_BRANCH_REQUESTS`, which answers *"may I act on another branch's requests"* and was being
read as *"is it my turn"* — which is why the screenshot showed Approve with **no current approver at
all**. Requiring the step separates them again: the override widens which *branches*, never which
*stage*.

**The engine cannot catch this on its own**, which is worth knowing before anyone tries.
`APPROVED` is legitimate at a `REQUEST_APPROVAL` step **and** at an `ISSUANCE` one, because approving
an issuance sends the same word — the action vocabulary cannot tell the two apart. So the assertion
belongs with the *caller*, which knows which act it is performing:
`WorkflowEngineService.requireCurrentStepIs(requestId, expected)`, called by the approval service and
both acknowledgement services, each naming its own step. Issuance approval already filters on
`StepType.ISSUANCE` and loads an existing `Issuance`, so it cannot run early.

**Permissive where the engine is permissive:** a request with no active instance passes through, since
`processStepAction` already no-ops for those and refusing would strand work nobody could clear.

*The general shape:* **when two rules answer "what stage is this at", one of them is wrong.** Status is
a consequence of an action; the step is the question. Prefer the step, and do not leave a second
notion beside it.

### The All Requests tab leaked across branches at SELF scope

`requestersList()` has three paths. ALL returns an empty list (no restriction, intended) and BRANCH
uses `findUserIdsByBranchId` (correctly filtered). **SELF used `getManagerAndSubordinateUserIds()`,
which resolved subordinates by title alone** — and a title is organisation-wide, "Teller" being the
same title at every branch. So "my subordinates" answered with everyone in the bank holding a
subordinate title.

Measured: the **Gulu Head Cashier is a SUPERVISOR**, therefore SELF-scoped, therefore took this path,
and their subordinates spanned **Gulu and Mbarara** — so they saw Mbarara's requests. Branch Managers
and BOMs were never affected: those roles are BRANCH-scoped and took the filtered query. Head Office
managers looked clean only by accident, because their subordinate titles exist nowhere else.

**A second fail-open in the same method:** it returned `Collections.emptyList()` for a user with no
title, and `RequestSearchDao` applies the requester predicate only when the list is *non-empty* — so
an empty list means **no restriction**. A missing title handed somebody every request in the bank.

Both closed. Subordinates are now looked up with `findUserIdsByTitleIdsAndBranchId`, and every path
ends in at least the caller's own id: a configuration gap narrows somebody to themselves, it never
widens them to everybody. An unidentifiable caller is refused rather than given an empty list.

*The general shape, worth remembering:* **wherever an "allowed ids" list drives a predicate, empty is
the widest answer, not the narrowest.** Every early return needs checking against that.

### Approving a request used to cost you the right to read it

A regression from the read guard above, and worth keeping as a lesson about what a "relationship with
a record" means.

`Request.currentApprover` names whoever must act **now**, and the engine moves it to the next tier as
part of approving. So the *routed to me* limb — the very thing that let an approver open the record —
stopped being true at the instant they approved. A supervisor is SELF-scoped by default
(`UnitRoleSeeder.SELF_SCOPED_ROLES`), and at SELF the scope check keys on the **requester**, who is
somebody else, so every other limb failed too. The detail page refetches as the approval modal
closes, so the reward for approving was **"You do not have access to this record."**

Worse than a stray message: the request can stay in the approver's *listing*, because
`getManagerAndSubordinateUserIds` includes a subordinate requester. A row that sits in your list and
will not open is the exact failure this scoping exists to prevent.

**Being routed a request is durable, not momentary.** The fourth limb asks whether the workflow ever
involved you, answered from `RequestStepLog` — which remembers after the routing has advanced. Any log
naming you counts, whatever its action: a step assigned to you and escalated past you was still yours
to see. Someone who approved something should be able to look at what they approved; that is the
ordinary expectation, and the basis of any later question about the decision.

**Read only.** `requireRequestChangeable` consults none of the widening limbs — not routing, not
participation, not `ISSUE_ITEMS`. Having approved something is not a licence to edit or delete it.

*Rejection has the same shape* — `handleRejection` nulls `currentApprover` — and is covered by the
same limb.

### The front end, and two rules that had drifted

**A unit-routed approval was invisible.** `actionRules.canApproveRequest` required
`isDesignatedApprover` — the named `currentApprover` — while `WorkflowEngineService.requireActorIsRouted`
admits **three** kinds of actor: that person, *a member of the `currentUnit` a group step was routed
to*, or a holder of `MANAGE_ALL_BRANCH_REQUESTS`.

The result was a dead end rather than an error, which is why it survived: the listing's inbox
predicate already matches on `currentUnit`, so a unit-routed request **appeared in someone's
"awaiting me" list and then offered no Approve button.** Nothing failed; the work simply could not be
actioned and nothing on screen said why.

The page could not have got this right, because **`RequestDTO` did not expose `currentUnit` at all**.
It does now, on both the list and the detail mappings, and `actionRules` mirrors the engine limb for
limb. Drift here misleads in one direction or hides an entitled control in the other, and the second
is much harder to notice.

**Issuance must not be scoped to the requester's branch — a regression caught by measuring.** The
first pass scoped `GET /issuance/{requestId}` through `requireReadableById`, which reads correctly and
is wrong: issuance is cross-branch by design, exactly as `createMovement` is. Worse, it would have
failed only *sometimes*, because the "routed to me" exception lapses the moment the last approval step
completes — `WorkflowEngineService` nulls `currentApprover` there — which is precisely when issuing
begins.

Measured rather than argued: of the **ten** accounts holding `ISSUE_ITEMS`, **five have no cross-branch
request reach** — three Head Office storekeepers with no unit, two at Gulu. Those five would have lost
the job the permission names. So `ISSUE_ITEMS` is now a third limb of `requireRequestReadable`, and
**read only**: `requireRequestChangeable` does not consult it, so an issuer still cannot edit or delete
what they are issuing against. It remains far narrower than what stood before, which was that any
holder of `READ_REQUEST` could read every request in the bank by id.

*What was already right:* the request routes are gated to match their endpoints
(`READ`/`CREATE`/`UPDATE_REQUEST`, `ISSUE_ITEMS`), and `canEditRequest` requires `isRequester` — stricter
than the backend guard, which is the safe direction.

### The engraved-number picker re-offered what you had just picked

Three faults in a closed loop, and the loop is why it looked so obviously broken.

**1. The Autocomplete had no identity rule.** `filterSelectedOptions` was set but
`isOptionEqualToValue` was not, so MUI compared options to the selected value by **reference**.

**2. Every fetch replaced the option objects.** `fetchAllAssets` rebuilt the pool wholesale, so the
asset you had picked was still there — as a *different object with the same id*, which reference
equality cannot match. (MUI says so out loud: *"The value provided to Autocomplete is invalid"*.)

**3. Picking an item triggered a fetch.** `addEngravedNumberListToRow` calls `setRows`, which mints a
new `row` object, and the picker's effect was keyed on `[row, …]`. So **selecting an asset refetched
the pool, replaced its identity, and put it straight back in the dropdown.**

The effect is now keyed on the values the query is actually built from (`commodityId`, `assetTypeId`,
`groupName`), so a selection no longer refetches, and the identity rule closes the other half.

*The general shape:* **an effect keyed on an object re-runs whenever anything in that object
changes** — including the field the effect's own output writes. Key on the values the work depends
on, not on the container they arrive in.

**Assets taken on another line are now hidden too.** `filterSelectedOptions` only hides what *this*
picker holds, so two lines of the same commodity each offered the whole pool. It was caught —
`validateAssetsOfItems` de-dupes across rows, and `validateAssetsReadyForIssuance` refuses repeats
within one payload — but only at submit, after the issuer had built the whole issuance around a
choice that was never available.

**The pool is bucketed by commodity and replaced, not accumulated.** It was one flat array that
`fetchAllAssets` only ever appended to. Every query filters to "Available for Issuance", so the
moment an asset is issued it stops coming back — **and an entry that never returns can never be
overwritten.** It simply stayed and went on being offered. The de-dupe there was written to fix
exactly that and could not: a row that has left the result set wins nothing by being merged last.
Bucketing is what makes replacement possible, since a single array cannot be replaced by a query
covering one commodity — the flat shape is what forced the pool to be additive, and additive is what
made it stale. Keyed on `id` rather than `engravedNumber`, which two assets awaiting completion both
leave blank.

A *search* still merges rather than replaces: it is narrowed by engraved number, so its result is a
slice of the commodity and treating it as the new truth would discard everything the user had not
typed.

**And the list is re-read when the dropdown opens.** Someone else can issue an asset while the form
sits open. Asking again at the moment of choosing is also what finally makes the post-refusal
`resetAssetPool()` do what its comment claimed — it used to clear the stale entry and then nothing
re-read it, leaving the dropdown empty until a row happened to change.

**What was already right, and worth not re-litigating:** the server is the authority and it holds.
`validateAssetsReadyForIssuance` refuses anything not "Available for Issuance" and names the reason
("already issued and awaiting delivery"), refuses repeats inside one payload, and `applyAssetIssuance`
stamps **Issued** for same- *and* cross-location issuance — so an asset leaves the pool when it is
issued, not when it is received. None of the above could cause a double issuance; it made the picker
promise things the server would then refuse.

**Four live rows predate that last fix and still read wrong.** Measured: assets 252, 403 and 405 sit
in the courier store *"Safe Boda — In Transit"* on movement 3 (`ISSUANCE_FULFILLMENT`, still
`IN_TRANSIT`, request 14) yet carry status `issuanceAvailable`; 453 is the same story from request 15.
Asset 403 was issued **twice** — requests 14 and 15 — which is precisely what the old cross-location
behaviour allowed. The current code cannot reproduce it, but **the guard trusts the status and the
status is lying**, so those four will still be offered and still be accepted. That is a data repair,
not a code change, and it is left for a decision rather than done quietly.

The call-site comment in `IssuanceService` still described the old behaviour — "cross-location assets
are left untouched here" — while the method beside it did the opposite. Corrected, because that is
the comment someone reads before "restoring" the behaviour that caused this.

## Export columns are configurable — done

A register running to fifteen columns prints as an unreadable wall. Somebody holding
**`UPDATE_EXPORT_COLUMNS`** now decides which columns each table puts in its PDF / Excel, in
Settings → *Export Columns*, and every download follows. Each user can narrow their own copy further
from the export menu's **Choose columns…**, and that stays in their browser.

**Tidiness, not confidentiality, and the page says so at the top.** Every column stays on screen for
anyone who can open the table, and the file is still built in the browser from rows it already holds
— so this cannot withhold anything from anybody, and reading it as an access control would put a
confidentiality expectation on a control that cannot carry one. Genuinely withholding a column means
not sending it in the API response, which is a different and larger piece of work.

**Why there is a backend at all, for a "frontend" feature.** Because one person sets it for everyone.
A per-viewer choice needs no server — but then the permission-holder would tick columns and nobody
else's export would change, and the permission would be decorative. The shared default needs
somewhere shared; the personal narrowing on top genuinely is local and lives in `localStorage`.

### The registry, and why `module` could not be the key

`exportTables.ts` gives each table a **stable key**. The obvious identity was the `module` string
every table already passes, and it cannot do the job:

- The assets page passes **the asset category's name** (`moduleName={currentAssetType.name}`), so one
  table arrives under **twelve** identities. Configure "Computers" and "Furniture" stays unconfigured.
- **Both** the asset-request tabs and the fleet-requisition tabs pass `"request"` — two unrelated
  tables under one name. The same collision that nearly emptied the transport row menu.

So a config keyed on `module` would fragment one table across twelve rows and merge two others into
one. These keys are chosen once and never derived.

**The columns are listed by hand because they cannot be discovered honestly.** Rows are built by
spreading the entity (`...fielsdata`) and the row interfaces end in `[key: string]: any`, so a
table's columns are whatever its mapper happened to leave behind — which is why the requests export
has been shipping a **"Requester ID"** column that exists only so the row menu can tell whose request
it is. Listing them *is* the curation.

*One entry caught while writing it:* the assets mapper destructures `purchaseCost` and
`costOfTheAsset` **out** of the row before spreading the rest, so neither can ever reach a file.
Listing them would have put two ticks in Settings that quietly did nothing — worse than their
absence, because somebody would tick them, check the file and conclude the feature was broken.

### Absence is the widest answer here, deliberately

A table with **no** saved configuration exports its defaults, not nothing. This ships against
twenty-odd tables nobody has configured, and the alternative is that every export in the bank comes
out blank on the day it deploys.

That only works because *absent* and *empty* are different states, so the service **refuses to store
an empty set** — a table configured to export nothing produces an empty file, which reads as a broken
report rather than a setting. This is the same shape as the "allowed ids" trap recorded above, where
an empty list silently meant *no restriction*; what matters is that the meaning of emptiness was
decided and written down as a test rather than stumbled into.

Three more fallbacks follow the same rule, each avoiding an empty file:

| When | Answer |
|---|---|
| the config endpoint is unreachable | export the defaults, don't block the download |
| a viewer's stored choice matches nothing any more | treat it as no choice |
| a registry key and a row key have drifted apart | export every column — untidy beats empty |

A viewer's choice is **intersected, never unioned**: a column dropped from the configuration does not
survive in someone's browser, or the one thing the permission is for would be overridden by everyone
locally.

### Where it plugs in

`TableUtills.narrowColumns` is the single choke point for the shared path — all seventeen
`TableComponent` tables plus the assets and requests pages, which call those exporters directly. The
movements and consignments registers build their own files and narrow through the **same resolver**,
because two register pages deciding columns differently is exactly how the bespoke exporters drifted
apart before they were unified. A table without a `tableKey` keeps today's behaviour exactly, which
is what let this land without a flag day.

**`GET /export-columns` is open to any signed-in user, and must stay that way.** Every export
consults it, so gating the read on the permission that *changes* it would 403 the download for
everyone who is not an administrator — the fourth instance of *the route's permission and the
endpoint's permission must be the same permission*. It is in
`EndpointGuardCoverageTest.DELIBERATELY_AUTHENTICATED_ONLY` with that reason; the write is guarded.

`UPDATE_EXPORT_COLUMNS` is declared inside `initializePermissions()` — a permission created anywhere
else exists in the table and never reaches the super administrator, silently. Being in that list also
puts it in Settings → Roles → *Action permissions*, so granting it needed no new screen.

### A page can miss its key silently, so a test now says it cannot

Shipped with two export handlers unkeyed, and the way it hid is worth keeping.

Narrowing runs inside `TableUtills` and only when the caller passes a `tableKey`. Miss it and nothing
fails and nothing warns — the export just keeps its old behaviour and prints **every key the row
carries**. On the requests page that was twenty columns: eight of them objects or arrays
(`commodities`, `currentUnit`, `attributes`, …) which a spreadsheet renders as `[object Object]`,
three internal routing flags, and `requesterID`, which exists only so the row menu can tell whose
request it is.

**It survived review because the same page had a second, correctly-keyed export path.**
`useRequestExport` was wired and worked; the All Requests tab builds its own file and was not. So the
feature demonstrably worked — just not from the tab people actually use. A silent fallback plus a
partial wiring is the combination that clicking around does not find.

`exportWiring.test.ts` walks the source: every caller of `generatePDFFromRows` /
`generateExcelFromRows` must pass a `tableKey`, and every key named anywhere must exist in the
registry — a typo resolves to "unregistered", which falls back to exporting everything, the same
silent wrong answer as omitting it. Verified by breaking it deliberately and watching it fail.

*The general shape:* **a fallback that means "behave as before" makes a missing wire invisible.**
That is the right fallback here — it is what let this land across twenty tables without a flag day —
so the safety has to come from a test that the wire exists, not from the runtime noticing.

### What the file actually gets to offer

The registry lists what a table *can* export, and for requests that is deliberately narrower than
what the row carries. Objects and arrays are excluded because they cannot print; routing flags and
the menu's `requesterID` because nobody reads them. `id` is offered as *Request no.* — it is the
reference people quote — along with Description, Created and Current stage, all off until asked for.

Ten columns to choose from, seven on by default, against the twenty the unnarrowed file was printing
— which is why its headings were breaking mid-word even in landscape.

**Still open:** the movements and consignments registers honour the configuration but have no
*Choose columns…* entry of their own, because they render their own toolbars rather than
`TableComponent`'s. Their users get the shared default, not a personal narrowing.

## Password reset worked exactly once per user

`PasswordReset` maps `user` as `@OneToOne`, so Hibernate makes `user_id` **unique**. `saveNewPassword`
built a fresh row on every reset, so the first one for a user succeeded and **every later one failed**
with `Duplicate entry: '<user id>'`. Anyone who had ever reset their password could never do it again,
and the message read as a database fault rather than as a feature that only works once.

**The row was deleted rather than made to upsert, because nothing read it.** The repository declared
no query methods and nothing outside its own package referenced it — the table was written on every
reset and consumed by nobody. What it stored was a **second bcrypt hash of the user's live password**
and the **reset JWT**: a duplicated credential and a replayable token, kept permanently, for no
purpose. Upserting would have fixed the error and kept the liability.

Knowing that a password changed, and when, is the real need behind it, and the audit trail already
records `PASSWORD_RESET_COMPLETED` as CRITICAL without storing anything secret.

**Gone entirely.** `V21__drop_password_reset.sql` drops the table, and the entity and repository are
deleted with it — an entity called `PasswordReset` sitting beside a reset service is exactly what
someone later adds a write to, and its `@OneToOne` would bring back both the stored credential and
the one-row-per-user failure. Nothing was migrated out first, deliberately: the rows were copies of
credentials, not records of anything, and what is worth keeping is already in `audit_event`.

`PasswordResetTest` pins all three — no write, the audit row still made, and the entity, repository
and table absent.

## Still open

**1. Permissions gating across the app — front-end sweep done.** Row menus are now filtered
centrally: `IOptions` carries an optional `permission`, and `TableUtills.handleOptionsFilter` drops
what the viewer does not hold. Before this only the assets page filtered its own menu, so every other
table offered Approve, Delete and Issue to anyone who could open it — the click came back 403, which
reads as a broken button rather than a boundary. A table added later is now gated by default.

Gated in the sweep: users (update / enable / unblock / disable / block), rejected requests
(delete / update), transport requests, inventory (receive delivery / correct / delete), GRN upload,
complete-repair, New Movement, New Workflow.

Two things it turned up:

- **Approval workflows were entirely unguarded** — every read *and* write fell through to
  `authenticated()`, so any signed-in user could retarget a step at themselves or delete a workflow
  so requests skipped approval. Writes now need `UPDATE_SETTING`; reads need `READ_SETTING`, **except
  the list, which also admits `CREATE_REQUEST`**. The create-request form renders
  `WorkflowRoutesPanel`, a read-only guide to the approval routes that apply at the requester's
  location, so gating the list on `READ_SETTING` alone gave every branch requester a 403 on the form
  they were filling in. Granting them `READ_SETTING` to fix it would have been the far larger change —
  it opens Settings — so the list is a disjunction, the same shape and for the same reason as the
  store directory. `/resolve` and `/{id}` stay on `READ_SETTING`: they serve the settings editor and
  the workflow tester, not the request form. This was a
  larger power than any single approval permission grants.
- **The four user account actions answer to `CREATE_USER`**, because they are POSTs under
  `/users/**`. Blocking someone who already exists is not a creation; the front end mirrors the rule
  rather than guessing, but the backend rule is worth correcting.

The three option contexts (asset, inventory, request) each redeclared the row-option shape inline and
had drifted; they now share `IOptions`.

Still open: `docs/PERMISSIONS-PLAN.md`, and the endpoints `EndpointGuardCoverageTest` still lists.

**2. `determineUserRole()` — deleted.** Along with `legacyRequestersList`,
`canSeeBranchStationaryRequests`, `canSeeBranchNonStationaryRequests`, `determineIfUserIsAdmin`,
`hasExplicitScope`, `seesEveryBranch`, the three `RequestSearchCriteria` filter fields they fed
(`isAdmin`, `isBranchStationery`, `isBranchNonStationery`) and their DAO predicates.
`RequestService.requestersList()` now reads `AccessScopeService` like everything else.

`LegacyVisibilityModelRemovedTest` pins the absence by reflection — the model failed *open* (its
`default` returned an empty requester list, which means *no restriction*), so if someone restored it
while debugging, nothing would look wrong.

**Do not confuse two things that share a name.** `Request.isBranchStationery` /
`isBranchNonStationery` are entity **fields** recording what a request *is*; `RequestReportService`
routes on them and they must stay. What was deleted is the identically-named *filter criteria*. The
test pins both directions.

**3. Asset Condition has no "Disposed" segment gap** — resolved; the projection now returns it and
the four counts partition the total exactly. Note the bug this surfaced: `assigned` was "any status
that is not in-maintenance and not require-update", which counted **written-off assets as In Use**.

**4. Store page filters — done.** `GET /store` declared `branchId`, `assetTypeId`, `storeType`; the
page sent `status`, `stockName` and `createdAt`. All three were inert (trap #2), not just Status.

- **Stock Name** is now real — declared on the endpoint, matched partial and case-insensitive on the
  commodity name.
- **Status** removed. It offered user-account states while the column beside it shows a *stock level*
  (low / warning / in stock) derived client-side from quantity — two unrelated vocabularies.
- **Stock Date** removed; `createdAt` was never a parameter here.

The four single-purpose `StoreBalanceRepository` listings collapsed into one `search()` with every
filter optional — deleted, not deprecated, so nothing reaches for one. Two traps were fixed on the
way: the optional category filter uses **explicit LEFT JOINs** (as a dotted path it would inner-join
and drop every uncategorised line when asking for "all categories"), and the listing now has an `id`
**tie-break** — it previously had no ordering at all, so paging repeated and dropped rows. That was
the third listing carrying that fault, after `AssetSearchDao` and `RequestSearchDao`.

- **Stock Level** added, and it is real. `StoreBalance.minLevel` is a per-line reorder threshold set
  through `PUT /inventory/balances/{id}/min-level` (the "Reorder at" column), and the rule
  `minLevel > 0 && quantity <= minLevel` already drove `/inventory/low-stock` and the branch overview.
  The store page's Status column **ignored it** and invented bands in the browser — under 5 low, 5–10
  warning, over 10 in stock. So a commodity with a threshold of 50 and 30 on hand read "in stock" here
  while the low-stock monitor correctly flagged it: **two screens, two answers, one commodity.** Both
  the column and the new filter now use the backend's rule, with `unmonitored` as a real fourth
  answer — a line with no threshold is never flagged however little is on hand, and listing those is
  how the gaps get found. The old bands also lost quantity exactly 5 (`< 5` and `> 5 && < 10` leave
  it uncovered), which is why a partition test now pins that the three levels sum to the whole.

**5. PDF exports — one exporter now.** `utils/pdf.js` is **deleted**; everything goes through
`utils/pdf/listPdf.ts`. The two paths in `TableUtills` differ only in where the rows come from — the
DataGrid or a fresh API call versus an array the page already holds — and there was never a reason
for them to produce different-looking documents. While the DataGrid path used the old exporter, the
register you got depended on which screen you exported from: one with repeating column headings, a
filter summary and page numbers, one without. The date range now travels as `meta` on both, so a
printed sheet says which slice of the data it is.

**6. Read exposure around the assets page — closed, with one decision recorded.**

| Endpoint | Now |
|---|---|
| `GET /assignment-history` | `READ_ASSET` |
| `GET /inventory/stores`, `/inventory/stores/{id}/assets` | any of `READ_STORE`, `READ_INVENTORY`, `RECEIVE_ASSET_IN_STORE`, `CREATE_MOVEMENT`, `PERFORM_STOCK_TAKE` |
| `GET /asset-types`, `/statuses`, `/branches` | left at `authenticated()` — **decision, not oversight** |

`assignment-history` was the sharp one: the chain of custody for the whole estate was readable by
anyone with a login.

The store directory is guarded by a **disjunction** because five unrelated jobs need it — the assets
page's "Receive into store" picker is used by someone holding `RECEIVE_ASSET_IN_STORE` who may have
no store permissions at all. Naming one permission would have broken a real page; the disjunction
still excludes a signed-in user holding none of them, which was the gap.

The lookup lists stay open because gating them on `READ_SETTING` breaks the assets page for anyone
without it.

`INVENTORY_ROUTE` is `/api/v1/stocks/**`, so it covers nothing under `/api/v1/inventory/**` — the
constant's *name* implies a coverage its *value* does not provide. Still true, still a trap.

`EndpointGuardCoverageTest` tracks what remains; its list is meant to shrink and must not be added
to without a reason.

**7. Units confer authority — done.** See `docs/UNIT_PERMISSIONS.md`. A unit now carries a
`Set<Role>` (`unit_role`, V18) and those roles join the authority union, so an Admin or Infra officer
outranks a branch officer holding the same title. `UnitRoleSeeder` creates the `ADMIN_UNIT` and
`INFRA_UNIT` roles as **peers** — identical starting permissions, narrowed from Settings — and pins
every seeded role to an explicit scope so nobody is narrowed on deploy day.

`VIEW_ALL_BRANCH_REQUESTS` is deliberately **not** granted by default: a branch request reaches Admin
through the workflow, which sets `Request.currentUnit`. Granting it would make every branch request
visible from the moment it was raised — easy to add later, hard to walk back.

The seeder is **create-only** where it matters: a permission revoked from `ADMIN_UNIT` in Settings
stays revoked across restarts.

**Who may act on a step — closed.** `WorkflowEngineService.requireActorIsRouted` now refuses an
action from someone the step was not routed to: the named `currentApprover`, or a member of
`currentUnit`. Before this the engine asked only *what* was being done, never *by whom* — the route
guard checked `APPROVE_REQUEST` and nothing after it asked whose request it was, so anyone who could
approve anything could approve everything, at any tier, including a unit's step. That made the unit
inbox a suggestion rather than an assignment.

Deliberately permissive in three cases, because a false refusal strands a request and nobody can
clear it: **no actor** (system/group-email step), **nothing routed** (pre-engine requests, or a step
whose approver did not resolve), and **`MANAGE_ALL_BRANCH_REQUESTS`** — the explicit "may act on any
branch's requests" grant, which is what an override is, and which the super administrator holds like
anyone else. An override is logged.

Separately: the approval endpoint attributed the decision to whatever `approverId` the **client**
sent, so the step log and audit trail carried a signature nobody checked. It must now match the
signed-in user. The frontend already sent its own id, so nothing changed for it.

`StepActorRoutingTest` covers all of it — and the permissive cases more carefully than the refusing
ones, since those are what stop a later tightening from stranding real work.

*Note for whoever adds a permission next:* `initializeSuperAdminRole` reconciles only against the
list `initializePermissions()` returns. A permission created anywhere else exists in the table but
never reaches the super administrator — silently, forever. Declare it in that list.

---

## Scoping the store module (stock take done; the rest still open)

Assets, requests, movements, inventory (`/stocks`) and the staff directory are scoped. **Stores are
not, fully.** This is the plan, written down because the module has a trap that the other four did
not.

### The trap: stores are not uniformly branch-owned

Scoping by `Store.location` is the wrong instinct and would break the bank:

| Type | Count | `location` | Who needs it |
|---|---|---|---|
| `ADMIN` | one per branch | that branch | that branch — genuinely branch-owned |
| `IT` | **one, bank-wide** | Head Office | **every branch** — repairs route here |
| `DISPOSAL` | **one, bank-wide** | Head Office | **every branch** — write-offs route here |
| `COURIER` | one per courier | Head Office by convention | movements in transit |

`StoreSeeder` asserts the IT and Disposal singletons on startup. Scope those by location and every
branch loses sight of them, taking the repair and disposal flows with them.

**The escape:** `StoreBalance` carries its **own `branch`** alongside its `store`. A Gulu asset
sitting in the bank-wide IT store still has `branch = Gulu` on its balance line. So — **scope the
balances by `branch`; do not scope the store directory by `location`.**

### Already done

`BranchScopeService` is a façade over `AccessScopeService.INVENTORY`, so `/inventory/balances`,
`/inventory/stores`, `GET /store` and `GET /store/{branchId}` are scoped, and `POST /stores` answers
to `requireCanChange`.

### The rest of the module — now done

1. ~~`PUT /stores/{id}/active` and `PUT /stores/{id}/name` — permission-gated only.~~ **Done.**
   Both reach a store **by id** and `UPDATE_STORE` was the whole check, so a branch officer could
   rename or deactivate another branch's department store, and rename the bank-wide IT store, by
   knowing its id. `StoreAdminService.requireStoreChangeable` now guards both, with **two rules**:
   an ordinary store answers to its **branch**; the IT and Disposal singletons answer to **nobody
   below ALL** — they stand at Head Office, so a location check alone would have handed them to any
   Head Office officer with branch reach, and one branch renaming a store the other twenty depend on
   is not a branch-sized decision. Half was already covered by accident: `setActive` refuses to
   deactivate a store with no department, which happens to include ADMIN, IT and Disposal. *Renaming
   had nothing at all.*
2. ~~Stock take — entirely unscoped.~~ **Done.** Scoped by `count.store.location` — see the note
   below on why that is a *different key* from balance visibility.
3. ~~`/stationery-report` and `/stationery-report/branch` — unchecked.~~ **Done.** Neither carried a
   `@PreAuthorize`, so both fell through to `authenticated()` and the bank's whole stationery
   position was readable with any login. Both now need `READ_STORE` or `READ_INVENTORY`, and the
   bank-wide one is **scoped as well as gated** — narrowed to the caller's own branch below ALL,
   rather than refused, because asking what stationery is in stock is a reasonable question about
   one's own branch. Neither is called from the front end, so the gate broke no page.

**Trap #1, found while reading those queries — fixed, but latent, not live.** Five
`StoreBalanceRepository` queries wrote `s.store IS NULL OR s.store.storeType <> COURIER`. The dotted
path inner-joins through the **nullable** `store`, dropping every storeless balance in the FROM
clause *before* the `IS NULL` disjunct can rescue it, so that disjunct was **dead code** — the
queries did not do what they plainly said. The author's intent is visible in the native-SQL sibling
beside them, which correctly uses a `LEFT JOIN`. All five now use an explicit join.

**Measured before claiming a bug: there are currently _no_ storeless balances** (`noStore = 0` of
41), so this fix changes no result today. It is defensive, not a repair. Worth saying plainly,
because a dead `IS NULL` branch reads like rows are being lost and they are not.

**And the nullable `branch` is a different story — leave it alone.** `summariseByBranch` groups on
`s.branch.id`, a dotted path through a **nullable** association, so branchless balances never reach
the branch overview. That looks like the same trap and is **not**: every branchless balance is
in-transit courier stock (7 of 41, all of them `COURIER`, none otherwise). Stock that has left one
branch and not reached another genuinely has no branch, and the rule everywhere else is that
*in-transit units are not available anywhere and must not be counted as branch stock*. The inner join
enforces exactly that, redundantly with the courier predicate beside it. "Fixing" it to a `LEFT JOIN`
would invent a phantom no-branch group in the branch overview holding stock the design says must not
be counted.

Two dotted paths through `store` **survive and should**: `findOnHandByLocation` filters on the
store's own location and `findCourierHeld` asks for couriers — both meaningless for a storeless
balance, so an inner join is the right join. Trap #1 is not "never write a dotted path"; it is
*never write one through an association the query is trying to treat as optional*.

### Stock take — done, and it scopes on a different key

**A stock take scopes by `count.store.location`; balance visibility scopes by `StoreBalance.branch`.**
That is not an inconsistency, and "fixing" one to match the other is the mistake to avoid.

A count is a physical act at a physical place — somebody at the shelves writing down what is on them.
So a Gulu officer counts Gulu's Admin store, and only Head Office counts the bank-wide IT and
Disposal stores, because nobody in Gulu can walk into those rooms. Visibility asks the other
question — *whose item is this?* — so a Gulu asset awaiting repair inside the Head Office IT store is
Gulu's to see.

Guarded: `openCount`, `saveCounts`, `submit`, `approve`, `sendBack`, `cancel`, `post`, `fetch`, and
the listing (filtered in memory — counts are tens of rows, and the rule is a property of the store's
location rather than something the two existing finders can express).

**Approval stays with the counting branch**, not Head Office. `StockTakeService` already refuses a
count approved by whoever counted it, so the control that matters — a second pair of eyes — is
present. Head-Office-only approval would put the decision with people who cannot see the shelves and
queue every branch behind them. `MANAGE_ALL_BRANCH_INVENTORY` remains the override.

**Accepted consequence:** a branch cannot formally *count* its own items inside a shared store.
Seeing them is a report and is answered by the branch-scoped balance listing.

**The movement flows are deliberately untouched.** Repair transfers, disposals and returns route
assets into the shared stores by *store*, not by branch. `RepairMovementService` guards on the
**asset's** branch, which is correct; adding a store-location check there would refuse every branch
its own repairs. `StockTakeScopeTest` pins that absence.

### Visibility inside the shared stores — done

A branch sees **its own items** in the bank-wide IT and Disposal stores. **Visibility only**; no
movement flow was touched.

Consumables were already right, by accident of a misleading name: **`StoreBalanceView.locationId`
carries `StoreBalance.branch`** — the *owning* branch — while `StoreView.locationId` on the sibling
view means the opposite, *where the store stands*. Do not "correct" the mapping; that accident is
why this half never had the bug.

Serialised assets did have it, and the obvious fix does not work. **`asset.branch` does not mean
"who owns this".** It means *where the asset is*: `InventoryService.relocateAsset` and
`returnAssetToStore` both set it to the destination store's location on transfer. The moment a Gulu
laptop reaches the IT store it reads **Head Office** — so Gulu lost sight of its own machine while
Head Office saw everyone's, and scoping the listing by `asset.branch` fixes nothing, because that
field has already forgotten.

Preserving the origin on `asset.branch` instead was the road not taken, and it is far larger than it
looks: that field also resolves **which Admin store a repaired asset goes home to**
(`RepairMovementService.currentStoreOf`) and **which branch the repair guard checks**
(`requireAssetInScope`). It would have changed the flows rather than the view of them.

The owning branch already survives on **`Movement.originLocation`**, captured before the transfer and
the same column the return leg aims at. `InventoryReportController.scopeAssets` now reaches an asset
when **either end is the caller's** — where it sits, or where it came from — mirroring the
multi-ended `requireCanViewAny` a movement already gets, and for the same reason: a record can
legitimately be in two places at once. Origins are fetched **one query per page**, newest movement
winning, so an asset repaired twice is not claimed by whoever held it two repairs ago.

`SharedStoreVisibilityTest` pins it, including that `relocateAsset` **still** writes the
destination's location — if that stops being true the origin lookup is redundant and the return leg
needs re-reading.

### Branch filter on the store page — done, and smaller than the plan assumed

Two of the plan's premises turned out not to hold, which is worth recording so nobody re-opens this:

- The store **landing page was already scoped** — `/inventory/branch-overview` filters to the
  caller's own branch, so a branch officer already saw only their own card. No totals leaked.
- The detail page **already had** the picker (`FilterBranchForm`) and already named the branch in the
  header beside it, and `GET /store` already resolved `branchId` through `AccessScopeService` and
  **refused** one the caller may not see.

So there was no data exposure and nothing to build. What was wrong was cosmetic and real: the picker
rendered for everyone, so below ALL scope **every option but the viewer's own returned a 403** — the
"page renders a control whose endpoint then refuses it" failure, where a click reads as a broken page
rather than as a boundary. It is now gated on `scopeFor('INVENTORY', 'VIEW') === 'ALL'`, label and
all — a lone "Branch" caption over nothing reads as a control that failed to load.

Nothing is starved by hiding it: `StoreViewPage` sets the initial branch itself (defaulting to the
user's own, or Head Office if they have none) and `BranchStoreReport` fetches the table on its own.

**The form's copy of that fetch was called "duplicative" here, and it was not** — see the store
detail page entry below. `BranchStoreReport`'s effect omitted `branchId`, so the picker's
`useEffect([branchId])` was the *only* thing reloading the table when the branch changed. Gating the
picker therefore took the reload away from everyone below ALL scope. The dependency is where it
belongs now, and the form no longer fetches anything.

### Opening a store page — three stacked faults, all fixed

A branch user opening `/store/admin`, `/store/it` or `/store/disposal` was told **"You do not have
access to this record."** Three separate causes, and fixing any one alone would not have helped.

**1. The page read the wrong branch field.** `StoreUtills.setCurrentUserBranch` resolved the viewer's
branch from `title.branch`. A **title is an organisation-wide job description** — "Branch Manager" is
the same title at every branch — so it commonly carries no branch, the lookup returned nothing, and
the code fell through to its Head Office default. The page then asked
`GET /store?branchId=<Head Office>`, which the server correctly refused. The user had a branch the
whole time; it was read from the wrong place. **`user.branch` is the duty station**, and it is what
`BranchScopeService.currentUserBranchId()` and `useAccessScope` both read — all three must agree.

The Head Office fallback now applies **only at ALL scope**. For anyone else, guessing at Head Office
just reproduces the 403 it was meant to avoid, so the branch is left unset and the page renders its
empty state instead of an error.

**2a. The store directory substituted the caller's own branch.** `GET /inventory/stores` passed
`locationId` through `BranchScopeService#resolve`, which turns a null into the caller's branch. For a
*balance* listing that is right — "no branch named" means "mine". For a **directory** it is fatal:
"the IT store, wherever it is" became "IT stores at Gulu", and there is no such thing. The query
returned nothing, so the post-query filter had nothing left to admit however carefully it was
written. A branch user's IT and Disposal pages showed an empty shelf while Head Office saw the same
store full — and the failure looked *identical* to the one 2b had just fixed, which is why it
survived a round of fixing. A branch named outright is still refused; only the substitution is gone.

**2b. The store directory was scoped by location** — the exact trap this section opens with, live in
the code. `GET /inventory/stores` filtered on `StoreView.locationId`, *where the store stands*, so
the IT and Disposal singletons at Head Office were removed from every branch's view. The visible
symptom was an empty asset panel on those two pages; the invisible one is worse, since anything
choosing a repair or write-off destination from that list could not offer them. **Directory open,
contents scoped**: the rows pass, and what is inside stays narrowed by `scopeBalances` (owning
branch) and `scopeAssets` (owning branch, or the branch it came from). That the bank has an IT store
is not a secret.

**3. The page looked the shared stores up by the viewer's own location** —
`locationId=<my branch>&storeType=IT`, which can only match for a Head Office user. `StoreAssetsPanel`
now finds the bank-wide stores **by type alone**, which widens nothing because the contents endpoint
scopes per viewer: the Head Office IT storekeeper sees the whole bench they actually manage, and Gulu
sees its own laptop on it.

**Hiding those pages from branch users was considered and rejected** — it would have undone the
shared-store visibility work, whose entire point is that a branch can see its own items on the Head
Office repair bench. The consumables half already worked, because `GET /store?branchId=…&storeType=IT`
filters `StoreBalance.branch`, the owning branch.

### The store detail page: one tab, two owners, and a branch nobody checked

The Admin / IT / Disposal pages rendered the wrong category with the wrong branch's rows, reliably.
Six separate faults, and they compounded rather than queued.

**1. The tab was chosen by a positional map that had gone stale.** `TabComponent` carried
`LEGACY_STATUS_TAB = {officeEquipment: 0, itEquipment: 1, stationery: 2, fleet: 3}`, read from
`StoreContext.selectedStatus`. `GET /asset-types` sorts **by name**, and the bank has **twelve**
categories — measured: index 0 is *Building & Construction*, 1 *Cleaning & Hygiene*, 2 *Computers*,
3 *Equipment*. So **every entry in the map pointed at the wrong category**: asking for Stationery
(really index 10) opened Computers. `selectedStatus` defaults to `officeEquipment`, so every visit
landed on index 0 whatever you had been looking at.

The live trigger was worse than the default. The store table also rendered a **status bar of four
chips** — Office Equipment, IT Equipment, Fleet, Stationery — which wrote into that same
`selectedStatus`. It was a *second category selector inside a table whose tabs already select the
category*, and the wrong one. **Removed rather than repaired.** A positional map onto a
server-ordered list cannot be kept correct: renaming a category reorders it, adding one shifts
everything below. The report now identifies its tab by the category's **id** and passes the index
in, so the tab and the fetch are one fact instead of two that drift.

**2. Changing branch did not reload the table.** `BranchStoreReport`'s fetch effect ran on
`[currentAssetType, storeType]` — **no `branchId`**. It went unnoticed because the only
branch-driven refetch lived *inside `FilterBranchForm`*, which renders **only at ALL scope**. So the
hidden dependency was supplied precisely for the users who could change branch through the picker,
and for nobody else. **This was a regression from gating that picker** — hiding a control also
removed a data-loading effect, and the CLAUDE.md note calling that fetch "duplicative" was wrong.

*The general shape:* **a data dependency living inside a conditionally-rendered control is a
dependency that disappears when the control does.** Loading belongs to the page, not to the widget
that happens to trigger it.

**3. The context outlives the page.** `StoreContextProvider` is mounted in `src/index.tsx`, so
`branchId`, `currentAssetType` and `storeReportTableData` survive navigation. Only `handleTabChange`
ever cleared the rows — so the one path that did not go through a tab click, arriving from the
landing page, was the one that needed it most. That is the "wrong data": the previous branch's rows,
under a new heading, with nothing saying they were stale.

**4. Replies were not sequenced.** Arriving fires the fetch several times as the branch, the
category and the container each settle, and the first of those carries the **previous** branch. A
slow early reply landed after the correct one and overwrote it. `StoreAssetsPanel`, in the same
folder, already guarded against that with a cancelled flag. The listing now clears its rows *before*
the call and carries a monotonic ticket.

**5. A child overwrote the page's branch.** `BranchStoreReport` called `setCurrentUserBranch()` with
no argument on mount — the signed-in user's *own* branch — fighting the `?branchId=` the page had
just read. It won or lost by effect ordering, and lost on the async path (a user with no branch on
their account), where the `await` put it last. Gone: the page owns that decision, because it is the
only place that can check the branch first.

**6. The page asked for branches it knew it could not see.** This is the scoping half, and the
server was never the problem: `GET /store` calls `branchScope.requireAccessTo`, which **refuses**
rather than substituting, so a branch user following a bookmarked `?branchId=<Head Office>` got a
403 and **nothing leaked**. Everything after the refusal was wrong. It was caught into a
`console.log` (trap #6), the table kept the previous branch's rows, and the header card read
*"Current branch: Head Office"* — because `GET /branches/{id}` is deliberately open to any login and
answered happily. **The page asserted you were looking at a store it had just been refused.**

`?branchId=` is now checked against `canView('INVENTORY', …)` — the same rule the server applies —
*before* any request is built. Out of reach falls back to the viewer's own branch and says so. The
drill-down itself was never the way in: the landing list comes from the scoped
`/inventory/branch-overview` and reads "Your Branch" below ALL. A URL is typed, bookmarked and
shared, which is what made it an input like any other.

### Two endpoints the store page was missing

**`GET /store` and `GET /store/{branchId}` were scoped but not gated.** Neither carried a
`@PreAuthorize`, so both fell through to `.anyRequest().authenticated()` and the rule was "any login,
your own branch". The page in front of them already requires `READ_STORE`, so this is the third
instance of *the route's permission and the endpoint's permission must be the same permission* —
fixed by giving them the same `READ_STORE`/`READ_INVENTORY` disjunction the stationery reports use.
One line came off `EndpointGuardCoverageTest`'s list, which is meant to shrink.

**`GET /store/category-counts` is new, and replaces twelve requests with one.** The "Inventory by
category" strip had no endpoint of its own, so the browser called `GET /store` **once per category**
with `pageSize=1` purely to read `totalElements` — twelve round trips to draw one row of tiles, and
twelve refusals when the branch is out of reach. The one thing that made the loop defensible was that
it could not disagree with the table beside it, so `StoreCategoryCountTest` pins the replacement
against the listing per category and in total, across every branch and both container settings.

*Deliberately:* uncategorised balance lines stay excluded, because the per-category loop never counted
them either — every call named a category — and including them would change the total printed beside
the tiles with nothing on screen to explain it.

**The strip also used to answer a refusal with a number.** When the counts could not be read it fell
to zero and rendered *"0 item lines in this store"* over *"No items in this store yet"* — two
confident statements about a store it had just been refused sight of, so a branch user following a
bookmarked `?branchId=` was told Head Office's store was empty. It now distinguishes *unknown* from
*none*: a dash instead of a total, and "Category totals are not available for this branch" instead of
the empty-state. No banner of its own — the page and the listing each name the refusal once already,
and two notices for one boundary crowd the screen; what a panel owes the reader is that it stops
asserting what it does not know.

*The general shape, and this codebase has now met it from four directions:* **a boundary must not
render as a fact.** A refused listing that keeps the previous rows, a refused count that reads as
zero, a refused branch named confidently in a header card, a 403 that reaches only a `console.log` —
all the same mistake, and all of them read to the user as the system stating something false rather
than declining to answer.

### `StoreUtills()` was a hook handing out private copies of shared state

Five components call it, and every `useState` inside it gave each of them their own. The failures
were silent rather than loud, which is why they lasted:

- `StoreViewPage` swapped its whole content for a spinner keyed on a `sendingRequest` belonging to an
  instance that never fetched anything — **unreachable code**.
- `TableData` passed the same dead flag to the grid, so the table never showed it was reloading, which
  is exactly what let a stale page pass for a fresh one.
- `tableHeaders` was filled in one component's copy and read as `[]` in the rest.

The state moved into `StoreContext`; the behaviour stayed in the hook. **A hook is the right shape for
behaviour and the wrong one for state two components must agree on.**

**And reviving that spinner would have been worse than leaving it dead.** Once the flag was real,
swapping the content on it would unmount `BranchStoreReport` mid-fetch — destroying the component
whose effect started the request — and remount it when the request ended, starting another:
an **infinite loop**. The page content stays mounted and the grid shows its own `loading`. A table
that is reloading should say so in place; it should not take the page with it.

*One ordering rule this turned up:* `resetStoreView` clears the **rows**, not the tabs. A page's
effects run *after* its children's, so clearing `tableHeaders` there would wipe the list
`BranchStoreReport` had just built and leave "No asset types configured" on a page with twelve
categories.

### Stock take was offered to people its endpoints refuse

A branch BOM opening Stock Take got **"Access Denied"** over **"Could not load stock takes."** Three
things lined up, and the third is the one worth remembering:

1. The **Stock Take button** on the store landing page was ungated.
2. The **route** sat under `READ_STORE`, while both its endpoints (`GET /stock-counts` and
   `GET /stock-adjustments`) require **`READ_STOCK_TAKE`**. Anyone who could see a store was let in.
3. **`READ_STOCK_TAKE` is granted to no role.** It is created in `initializePermissions()`, so the
   row exists and the super administrator gets it by reconciliation — but `RolePermissionSeeder`
   grants only the request permissions, to `MANAGER` and `OFFICER`. Nothing has ever attached a
   stock-take permission to anything.

So this was never BOM-specific; it hit **every role**. Both the button and the route now ask for
`READ_STOCK_TAKE`. Holding `READ_STORE` says you may see what a store holds — reading a count is a
narrower thing and has its own permission.

**Granting stays administrative, by decision.** All three stock-take permissions are already listed
in Settings → Roles → *Action permissions*; who counts and who approves is a control decision per
branch, not something to bake into a deploy. If that is ever revisited, the grant must go through
`OneTimeSeed` — a plain reconciliation seeder would resurrect a permission an administrator had
revoked on the next restart, which is a bug this codebase has already had once.

*The general rule this is the third instance of:* **the route's permission and the endpoint's
permission must be the same permission.** When they differ the page opens and the data does not, and
that reads as a broken screen rather than as a boundary.

### Follow the existing shape

`AccessScopeService.INVENTORY` and its `VIEW_ALL_BRANCH_INVENTORY` / `MANAGE_ALL_BRANCH_INVENTORY`
multipliers already exist — **no new permissions are needed.** Floor at BRANCH, never SELF: a store
belongs to a branch and to no individual, so SELF would show a storekeeper an empty page. And use
explicit `LEFT JOIN`s for every optional filter (trap #1).
