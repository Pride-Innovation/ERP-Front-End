# Permissions gating — plan

Scope: every page and every action **except the dashboard**, which was done first.

Last reconciled against the code on **2026-08-27**. Sections 1 and 2 describe what is actually in
the repo today — they were re-derived from the source, not carried forward from the previous draft,
which had gone stale in both directions (it claimed there were no route guards long after they
landed, and claimed assets were unguarded when the URL matchers had been there all along).

---

## 1. What exists today

**Frontend**

| Layer | State |
|---|---|
| Sidebar | Filters by permission — `sideBarElements.tsx` gives each entry an `access: has(...)` |
| Route guards | **Done.** `PrivateRoute` takes `permission` / `anyOf` / `allOf` and redirects to `/restricted-access` carrying the missing permission name |
| In-page checks | `RequirePermission` wrapper and the `usePermissions` hook (`has`, `hasAny`, `hasAll`, `isSuperAdmin`) |
| Create buttons | `TableComponent` takes `createPermission` |
| Export / import buttons | `TableComponent` takes `exportPermission` / `importPermission` — wired on assets only |
| Row actions | Filtered by permission on the **assets**, **movements** and **consignments** pages; every other module still filters by status and module name alone |

Routes carrying a permission today: assets (`READ_`/`CREATE_`/`UPDATE_ASSET`), requests
(`READ_`/`CREATE_`/`UPDATE_REQUEST`, `ISSUE_ITEMS`), inventory, users, store, settings
(`READ_SETTING`), audit trails (`READ_AUDIT`), reports (`READ_AUDIT`), approval workflows
(`READ_SETTING`), movement and consignments (`READ_MOVEMENT` / `CREATE_MOVEMENT`).

Deliberately not gated: `/notifications`, `/profile`, `/restricted-access`, and Transport — which is
a coming-soon placeholder whose backend permissions do not exist yet.

**Backend**

| Layer | State |
|---|---|
| URL matchers | `assets` (incl. the lifecycle sub-routes), `requests`, `users`, `roles`, `permissions`, `statuses`, `stocks`, `audit`, `movements/disposal`, `export/assets`, reports |
| `@PreAuthorize` | `MovementController`, `RepairMovementController`, `ConsignmentController`, `StockTakeController`, `StoreController`, `StockLedgerController`, `InventoryReportController` |
| Everything else | Falls through to `.anyRequest().authenticated()` |

`@EnableMethodSecurity` is on, so `@PreAuthorize` works. `DataInitializer` reconciles `SUPER_ADMIN`
against every seeded permission on **each startup**, so a newly added permission is granted to it
automatically — do not hand-maintain that list.

### The gaps

**109 endpoints** are reachable by any signed-in user. That is a measured figure, not an estimate:
`EndpointGuardCoverageTest` enumerates them, and its `KNOWN_UNGUARDED` list is the authoritative
work queue. What follows is that list grouped; the numbers will drift, so trust the test.

| Area | Endpoints | Note |
|---|---|---|
| Settings reference data | 57 | branches, departments, units, titles, regions, districts, suppliers, couriers, consultants, commodities, asset-types. Anyone can create or delete a branch. `READ_SETTING` guards the *route* but not the API behind it |
| Issuance / GRN / reconciliation | 13 | writes partly covered by POST matchers, reads open |
| Inventory, store, statuses | 14 | see below |
| Reporting | 11 | each returns aggregates across the estate |
| Approval workflows | 8 | the route asks `READ_SETTING`; the controller asks nothing. Editing one changes who approves what, bank-wide |
| Audit | 6 | matched to `.authenticated()` deliberately-for-now; `READ_AUDIT` exists and is unused here |
| Bulk extracts | 2 | `/export/inventory` and `/export/request` — the same hole `EXPORT_ASSET` closed for assets |

**The inventory one is worth calling out.** `INVENTORY_ROUTE` is `/api/v1/stocks/**`, so it covers
nothing under `/api/v1/inventory/**` — eight endpoints including `branch-overview`, `low-stock` and
`stores/{id}/assets`. The constant's *name* implies a coverage its *value* does not provide, which
is exactly the kind of gap reading the config confidently will not find. `GET /store` and
`GET /statuses` are open for the same reason: their siblings are matched and they are not.

Also outstanding, and not an endpoint problem: **row actions outside assets, movements and
consignments** — a user without `DELETE_REQUEST` is still offered Delete and discovers the refusal
on the destination page.

---

## 2. What has landed

### 2.1 Dashboard (done)

Two axes — `DASH_VIEW_*` for subject, `DASH_SCOPE_*` for reach — deliberately separate from the
`READ_*` route permissions. See the main `CLAUDE.md`.

### 2.2 Assets page (done — 2026-08-27)

The first page taken end to end, and the template for the rest.

**Six new permissions**, because the URL matchers keyed on the HTTP verb and so collapsed distinct
duties into one: every `POST /assets/**` answered to `CREATE_ASSET`, every `PUT` to `UPDATE_ASSET`.

| Permission | Guards | Endpoint |
|---|---|---|
| `REASSIGN_ASSET` | move an asset between officers | `POST /assets/reassign/{id}` |
| `REPAIR_ASSET` | book a repair, close it off | `POST` / `PUT /assets/repairs/**` |
| `RECEIVE_ASSET_IN_STORE` | hand an asset into a store | `PUT /assets/store/{id}` |
| `DISPOSE_ASSET` | write an asset off | `POST /movements/disposal` (+ preview) |
| `IMPORT_ASSET` | bulk register from a spreadsheet | `POST /assets/bulk-insert`, `GET /assets/import-template/**` |
| `EXPORT_ASSET` | extract the register to a file | `GET /export/assets` |

Two routes were reachable with any valid token because they matched no rule at all: **disposal**
(it lives under `/movements`, not `/assets`) and **`GET /export/assets`** (the whole register,
unpaginated — a way *around* `READ_ASSET` rather than an extension of it).

`GET /assets/statistics` now accepts `READ_ASSET` **or** `DASH_VIEW_ASSETS`. It previously demanded
`READ_ASSET`, so the dashboard rendered "Assets by Category" and "Asset Condition" for a viewer whose
own endpoint then refused them.

Frontend: the row menu is filtered in `pages/assets/general/index.tsx`, and the toolbar takes
`exportPermission` / `importPermission`.

`AssetRouteAuthorizationTest` pins all of it — 16 cases, asserting a 403 for the permission that must
*not* open each route and "anything but 403" for the one that must.

### 2.3 Roles and permissions screen (done — 2026-08-27)

The screen renders **every seeded permission**. It previously rendered a fixed twelve rows plus the
module CRUD grid, so `VIEW_ALL_BRANCHES` and the three stock-take permissions were seeded and
enforced but had no control anywhere in Settings — the only way to grant one was an UPDATE against
the database.

`ActionPermissions.tsx` keeps a curated list for wording and grouping, then renders everything from
the live `/permissions` response that neither it nor the CRUD grid covers under **"Other
permissions"**. A permission added to the backend seed appears on the next page load with no
frontend release. **Do not turn that catch-all back into a fixed list.**

The CRUD grid also now matches permissions by exact `VERB_MODULE` name. It used to test whether the
name *contained* the verb and *contained* the module, which breaks as soon as one permission name
contains another's words — `RECEIVE_ASSET_IN_STORE` carries both "ASSET" and "STORE".

### 2.4 Movements and consignments (done — 2026-08-27)

26 endpoints that had answered to nothing but `.anyRequest().authenticated()`. Six new permissions,
enforced with `@PreAuthorize` on the controller methods:

| Permission | Guards |
|---|---|
| `READ_MOVEMENT` | the movements and consignments listings, details and approval trail |
| `CREATE_MOVEMENT` | raising a movement, repair transfer, temp replacement or return; assembling a consignment; attaching documents |
| `DISPATCH_MOVEMENT` | dispatch and mark-in-transit, for both movements and consignments |
| `RECEIVE_MOVEMENT` | receive, mark arrived, hand over — and `complete`, which is the intra-location equivalent and lands the goods |
| `CANCEL_MOVEMENT` | cancelling a movement or a consignment |
| `APPROVE_MOVEMENT` | approve, reject, the approver inbox, and the bypass |

The frontend moved off the asset permissions it had been borrowing: the movement routes and the
sidebar entry now ask for `READ_MOVEMENT` / `CREATE_MOVEMENT`, and the row actions in
`MovementTable` and `ConsignmentTable` are filtered by the permission behind each endpoint. Those
tables already had `can*` predicates mirroring the server's state machine; those answer "is this
movement in a state where the action is possible", which is a different question from "may this user
perform it". Both now have to hold.

**The bypass is not an endpoint.** `proceedWithoutApproval` is a flag on the create payload, set by
five different create paths, so no `@PreAuthorize` can reach it. It is enforced in
`MovementApprovalService#startApproval` — the single funnel all five pass through — and refused
rather than downgraded, because the caller has explicitly asked to proceed and parking the movement
in DRAFT would leave it waiting on an approver who does not exist. Annotating the create endpoints
instead would have meant anyone who could raise a movement could authorise its own bypass.

`MovementRouteAuthorizationTest` (26 cases) and `MovementApprovalBypassTest` (5) pin all of it. The
first had to learn to tell two kinds of 403 apart: `listMovements` throws `AccessDeniedException` of
its own when the caller has no branch, and a test that merely counted 403s would have passed with
every `@PreAuthorize` deleted.

**Not yet granted to anyone.** These endpoints were open, so every role could use them. Grant the
six in Settings → Roles **before** deploying, or movements stop working for the people who run them.

### 2.5 The coverage test (done — 2026-08-27)

`EndpointGuardCoverageTest` walks every request-mapped handler and fails when one answers to nothing
but "be signed in". This is the piece that stops the gap reopening, and it is why the figures above
are counted rather than guessed.

**How it decides.** A method carrying `@PreAuthorize` is guarded, by inspection. Everything else is
probed: the request is issued as a signed-in user holding no authorities, and a 403 means a matcher
refused it. The two halves are not interchangeable — matcher rules run in the filter chain before
the DispatcherServlet, so their refusal always arrives, whereas `@PreAuthorize` runs *after*
argument resolution, so an endpoint with a required parameter would answer 400 before its guard was
consulted and probing alone would report it as open.

**`KNOWN_UNGUARDED` is the work queue.** The test asserts the gap set matches it exactly, in both
directions: a newly unguarded endpoint fails the build, and so does a listed one that has since been
guarded but left in the list. The second half is what stops the list becoming a graveyard that
excuses everything. **It should only ever shrink.** Both directions were verified by deliberately
breaking each and watching the build go red.

`DELIBERATELY_AUTHENTICATED_ONLY` is separate and small — `assets/my-assets` and the four
notification endpoints, each of which resolves the caller from the JWT and can only ever act on
their own records. Authentication is not a weaker guard there; it is the whole of the question.

---

## 3. Design

### 3.1 One permission per resource-action, not per endpoint

Reuse the existing READ / CREATE / UPDATE / DELETE vocabulary. New permissions only where a
genuinely new capability exists. The asset and movement sets in section 2 are the worked examples;
the only one still outstanding is:

| New permission | Guards |
|---|---|
| `MANAGE_WORKFLOW` | creating and editing approval workflows |

**Split an action out when it is a different duty, not when it is a different endpoint.** Dispatch
and receive are separate from create because raising a transfer and physically handing custody over
are done by different people, and the audit trail has always recorded them separately. The assets
work is the evidence for the converse: folding actions together *because they shared an HTTP verb*
is what let anyone who could register an asset also reassign one and import a spreadsheet of
several thousand.

The test of a split is whether you can name two people in the bank who should have one and not the
other. If you cannot, it is one permission.

Settings reuse `READ_SETTING` / `CREATE_SETTING` / `UPDATE_SETTING` / `DELETE_SETTING` across all
reference data — one Settings section, one set of keys, rather than eleven near-identical triples.

### 3.2 Backend: prefer method annotations for new work

New guards go on the controller method as `@PreAuthorize`: the rule sits beside the code it
protects, and it survives a route being renamed.

The assets work is the exception that proves the point. Its rules went into
`SecurityConfiguration` because the `ASSET_ROUTE` verb matchers were already there and splitting one
resource's rules across two mechanisms is worse than either — but it cost an ordered block of
matchers where **a more specific rule declared after a general one silently never fires**, and a
test written specifically to pin that ordering. Do not extend that block without extending the test.

### 3.3 Frontend: guard the route, then the action

`PrivateRoute` on the route decides whether the page opens. `RequirePermission` and `has()` decide
what within it is offered. Both read the same `PERMISSIONS` constants as the sidebar.

Filter row menus **where the options are built**, not in `components/tables/utills.tsx`. That
function branches on hardcoded module names (`'IT Equipment'`, `'Office Equipment'`, `'Fleet'`), and
asset categories have been configurable since the single `:typeId` route landed — a category added
in Settings matches none of them and falls through unfiltered. Permission is not a per-category
question, so it does not belong in a per-category branch.

### 3.4 The frontend never enforces anything

Every guard is a duplicate of a server rule, present so the UI does not offer what will 403. The
server is the authority. **Rule: no frontend guard ships without its backend counterpart.**

---

## 4. Remaining phases

### Phase 1 — Settings (do next — 57 of the 109)

- Annotate all eleven reference-data controllers using the SETTING keys.
- Confirm `READ_ROLE` and `UPDATE_ROLE` guard role editing — that screen is where permissions
  themselves are granted, and it is now the screen that can grant *all* of them.

### Phase 2 — Workflows, issuance, GRN

- `MANAGE_WORKFLOW` on `ApprovalWorkflowController`; `READ_REQUEST` on `WorkflowInstanceController`.
  The route currently asks for `READ_SETTING`, which is not the same question.
- Reads on issuance, GRN and reconciliation to match their existing POST guards.

### Phase 3 — Row actions by permission, page by page

Assets, movements and consignments are done. Repeat for requests, store and inventory, filtering
where the options are built (see 3.3).

### Phase 4 — Finish the export story

See section 5.

---

## 5. Known hole: export and read are the same request

`EXPORT_ASSET` hides the export button and closes `GET /export/assets`, but the assets page does not
call that endpoint. `handleExport` refetches through `GET /assets` with `pageSize: 10_000`, because
`/export/assets` accepts only `assetTypeId` and a date range and would silently drop the status,
name, model, location and holder filters the user is looking at.

So a `READ_ASSET` holder calling the API directly can still pull the register a large page at a
time. The server cannot tell the two apart, because they are the same request.

Closing it properly means teaching `/export/assets` the same filter set as `GET /assets` and pointing
the page at it. Related: these list exports are not audited — only `REPORT_EXPORTED` from the reports
page is, so "exports are audited" is currently true of the reports page and not of the list pages.

The coverage test also found the other two extracts — `GET /export/inventory` and
`GET /export/request` — still open to any signed-in user, the same hole `EXPORT_ASSET` closed for
assets. Those want `EXPORT_INVENTORY` / `EXPORT_REQUEST` on the same reasoning: reading a page at a
time on screen and walking out with the whole set are different acts.

---

## 6. Risks

- **The movement guards will lock people out** if roles are not granted first. Those endpoints were
  open, so everyone could use them; now only granted roles can. Grant the six movement permissions
  in Settings → Roles **before** this deploys. This is the live risk, not a future one.
- **SUPER_ADMIN bypasses everything** on both sides, so it cannot be used to test a guard. Test with
  a purpose-made role — that is what `AssetRouteAuthorizationTest` does with `@WithMockUser`.
- **The sidebar and the route guard must agree**, or a user sees a link that then rejects them.
- **Matcher order in `SecurityConfiguration`.** First match wins. A specific rule below a general one
  still *works* — it simply answers to the wrong permission, and nothing reports it.
- **Do not read coverage off the route constants.** `INVENTORY_ROUTE` is `/api/v1/stocks/**` and
  covers nothing under `/api/v1/inventory/**`; the name implies a reach the value does not have.
  `EndpointGuardCoverageTest` is the only trustworthy answer to "is this guarded" — ask it, and add
  the endpoint to a rule rather than to `KNOWN_UNGUARDED`.
