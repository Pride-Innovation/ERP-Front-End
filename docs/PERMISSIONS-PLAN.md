# Permissions gating — plan

Scope: every page and every action **except the dashboard**, which is done.

---

## 1. What exists today

**Frontend**

| Layer | State |
|---|---|
| Sidebar | Filters by permission — `sideBarElements.tsx` gives each entry an `access: has(...)` |
| Route guards | **None.** No `ProtectedRoute`. Typing a URL reaches any page |
| Page-level checks | 8 files call `usePermissions`, out of roughly 60 pages |
| Create buttons | `TableComponent` takes `createPermission`, used on about 5 tables |
| Row actions | Filtered by `handleOptionsFilter` in `components/tables/utills.tsx` — but by **status and module name**, not by permission |

The sidebar filter is cosmetic. A user without `READ_USER` sees no Users link and reaches
`/assets-mgt/users` by typing it.

**Backend**

| Layer | State |
|---|---|
| URL matchers | `assets`, `requests`, `users`, `roles`, `permissions`, `statuses`, `stocks`, `audit`, reports |
| `@PreAuthorize` | `StockTakeController`, `StoreController`, `StockLedgerController`, `InventoryReportController` |
| Everything else | Falls through to `.anyRequest().authenticated()` |

63 permissions are defined and seeded. `@EnableMethodSecurity` is on, so `@PreAuthorize` works.

### The gaps, ranked by consequence

1. **Movements — 23 endpoints, entirely unguarded.** Any authenticated user can create, dispatch,
   mark in transit, receive, cancel a movement, or raise a repair/disposal transfer. This is the
   module that physically moves stock between buildings.
2. **Consignments — 11 endpoints, unguarded.** Same exposure at the journey level.
3. **Settings reference data — roughly 50 endpoints, unguarded.** branches, departments, units,
   titles, regions, districts, suppliers, couriers, consultants, commodities, asset-types. Anyone
   can create or delete a branch. `READ_SETTING` and `UPDATE_SETTING` exist and are used only by the
   sidebar.
4. **Approval workflows — unguarded.** Editing a workflow changes who approves what, bank-wide.
5. **Issuance / GRN / reconciliation / export** — partly covered by POST matchers; reads are open.
6. **No route guards at all on the frontend.**

---

## 2. Design

### 2.1 One permission per resource-action, not per endpoint

Reuse the existing READ / CREATE / UPDATE / DELETE vocabulary. New permissions only where a
genuinely new capability exists:

| New permission | Guards |
|---|---|
| `READ_MOVEMENT` | listing and viewing movements and consignments |
| `CREATE_MOVEMENT` | raising a movement, repair transfer, return, disposal transfer |
| `DISPATCH_MOVEMENT` | dispatch, mark in transit — custody leaving a building |
| `RECEIVE_MOVEMENT` | receive, hand over, mark arrived |
| `CANCEL_MOVEMENT` | cancelling a movement or consignment |
| `APPROVE_MOVEMENT` | approving or rejecting a movement, and the bypass |
| `MANAGE_WORKFLOW` | creating and editing approval workflows |

Dispatch and receive are separated from create deliberately: raising a transfer and physically
sending stock out are different acts by different people, and the audit trail already treats them
so.

Settings reuse `READ_SETTING` / `CREATE_SETTING` / `UPDATE_SETTING` / `DELETE_SETTING` across all
reference data — one Settings section, one set of keys, rather than eleven near-identical triples.

### 2.2 Backend: method annotations, not URL matchers

New guards go on the controller method as `@PreAuthorize`. Three reasons: the rule sits beside the
code it protects; it survives a route being renamed; and `SecurityConfiguration` is already about
100 lines of matchers where ordering matters and a more-specific rule declared after a general one
silently never fires.

Existing matchers stay — moving them is churn without benefit.

### 2.3 Frontend: guard the route, not the page

A single `RequirePermission` wrapper in `AppRoutes`, redirecting to the existing `ROUTES.ERRORS`
(`/restricted-access`) page. One place, declarative, and impossible to forget on a new page because
the route has to be registered anyway.

Page-level `has()` checks stay for within-page variation — a tab, a panel, a button.

### 2.4 The frontend never enforces anything

Every guard is a duplicate of a server rule, present so the UI does not offer what will 403. The
server is the authority. **Rule: no frontend guard ships without its backend counterpart.**

---

## 3. Phases

Each phase is independently shippable and independently testable.

### Phase 1 — Movements and consignments (highest risk, do first)

- Add the six movement permissions to `Constants` and `DataInitializer`, and to the frontend
  `PERMISSIONS` catalogue and Settings metadata as a new group.
- Annotate all 23 `MovementController` and `RepairMovementController` endpoints, and all 11
  `ConsignmentController` endpoints.
- **`APPROVE_MOVEMENT` gates the approval-bypass path specifically** — it is the one action that
  lets stock move with no approval at all, and it is already audited as CRITICAL.
- Frontend: gate the Movements and Consignments routes on `READ_MOVEMENT`; gate the action buttons
  (Dispatch, Receive, Hand over, Cancel, Approve) on their own permissions.

**Migration:** grant all six to SUPER_ADMIN and ADMIN in the seeder, and — because these endpoints
were previously open to any authenticated user — grant storekeepers and admins their permissions
*before* the deploy, or movements stop working for them.

### Phase 2 — Route guards

- `RequirePermission` wrapper; apply to every route in `AppRoutes`.
- Map each route to its permission (table in section 4).
- Redirect unauthorised users to `/restricted-access` rather than blanking the page.

### Phase 3 — Settings

- Annotate all eleven reference-data controllers using the SETTING keys.
- Guard the Settings routes.
- Confirm `READ_ROLE` and `UPDATE_ROLE` already guard role editing — that screen is where
  permissions themselves are granted.

### Phase 4 — Workflows, issuance, GRN, export

- `MANAGE_WORKFLOW` on `ApprovalWorkflowController`; `READ_REQUEST` on `WorkflowInstanceController`.
- Reads on issuance, GRN and reconciliation to match their existing POST guards.
- `ExportController` to require the read permission of whatever it exports.

### Phase 5 — Row actions by permission

`handleOptionsFilter` filters row menus by status and module name only, so a user without
`DELETE_REQUEST` is still offered Delete and discovers the refusal on the destination page. Pass the
permission set in and filter on it as well as status.

### Phase 6 — Audit the guards themselves

A test that walks every request-mapped method and asserts it is covered by either a URL matcher or a
method annotation, failing on anything that falls through to bare `authenticated()`. This is what
stops the gap reopening — every gap in section 1 was a route nobody remembered to add.

---

## 4. Route to permission map

| Route | Permission |
|---|---|
| `/assets-mgt` (dashboard) | authenticated |
| `/assets-mgt/assets/**` | `READ_ASSET` |
| `/assets-mgt/asset-request/**` | `READ_REQUEST` |
| `/assets-mgt/transport-request/**` | `READ_TRANSPORT` |
| `/assets-mgt/inventory/**` | `READ_INVENTORY` |
| `/assets-mgt/store/**` | `READ_STORE` |
| `/assets-mgt/store/stock-take` | `READ_STOCK_TAKE` |
| `/assets-mgt/movement/**` | `READ_MOVEMENT` |
| `/assets-mgt/movement/consignments` | `READ_MOVEMENT` |
| `/assets-mgt/reports` | `READ_ASSET` or `READ_REQUEST` or `READ_STORE` |
| `/assets-mgt/trails` | `READ_AUDIT` |
| `/assets-mgt/users/**` | `READ_USER` |
| `/assets-mgt/settings/**` | `READ_SETTING` |
| `/assets-mgt/approval-workflows` | `MANAGE_WORKFLOW` |
| `/assets-mgt/profile` and `/notifications` | authenticated |

Create and update sub-routes take the matching CREATE or UPDATE permission rather than the read one.

---

## 5. Risks

- **Phase 1 will lock people out** if roles are not granted first. Movements are open today, so
  everyone can use them; the day guards land, only granted roles can. Grant before deploying.
- **`READ_SETTING` is rarely granted.** Check who holds it before Phase 3, or Settings goes dark for
  people who currently use it.
- **SUPER_ADMIN bypasses everything** on both sides, so it cannot be used to test a guard. Test with
  a purpose-made role.
- **The sidebar and the route guard must agree**, or a user sees a link that then rejects them. Both
  read the same `PERMISSIONS` constants, so keep them in one table.

---

## 6. Order of work

1. Phase 1 (movements) — the real exposure
2. Phase 2 (route guards) — closes URL-typing across the whole app
3. Phase 6 (the coverage test) — early, so phases 3 to 5 cannot regress
4. Phases 3, 4 and 5 in any order

Phases 1 and 2 together close the material risk. The rest is completeness.
