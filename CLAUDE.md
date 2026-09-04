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
  so requests skipped approval. Reads now need `READ_SETTING`, writes `UPDATE_SETTING`. This was a
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
