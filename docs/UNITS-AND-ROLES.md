# Units, roles and the "superior officer" problem

Written 2026-08-27, from reading the code rather than the intent. This records **what the system
actually does today**, because the answer is not what the design assumes.

---

## 1. The intent

Head Office has two units — **Admin Unit** and **Infra Unit** — and an officer in either is
*superior* to an ordinary officer elsewhere. They service the whole bank: they issue items, they
receive assets into stores, they act on requests raised by people in branches.

## 2. What the system actually does

### 2.1 A unit is a group mailbox with a department, and nothing else

```
Unit { id, name, groupEmail, department }
```

Seeded create-only by `UnitSeeder`: **Infra Unit** (department shortCode `BT`) and **Admin Unit**
(`ADM`). A unit carries no permissions, no rank and no relationship to any role.

### 2.2 Units are consulted in exactly three places

| Where | What it does |
|---|---|
| `ApprovalStep.unit` | A `GROUP_EMAIL` step routes to a unit's mailbox instead of an individual |
| `Request.currentUnit` | Set when such a step becomes current, so the request appears in the inbox of anyone in that unit (`RequestSearchDao`, `currentUnitId`) |
| `AssetRepository.findByOrganisationScope(branchId, departmentId, unitId)` | An optional filter on the inventory report — a reporting convenience, not a rule |

That is the whole of it.

### 2.3 Units play **no part** in asset actions

`AssetService` never reads `getUnit()`. Neither does any asset permission check, on either side of
the wire. An Admin Unit officer and a branch officer with the same role have **identical** rights
over every asset action — reassign, repair, receive into store, dispose, import, export.

### 2.4 The "Admin is superior" logic exists but never runs

`RequestService.determineUserRole()` has cases for `ADMIN_OFFICER` and `ADMIN_MANAGER`, and
`legacyRequestersList` gives them bank-wide request visibility. `canSeeBranchNonStationaryRequests()`
returns `true` for them.

**Neither role is seeded.** `roles.json` defines: `ROLE_ADMIN`, `MANAGER`, `OFFICER`,
`HEAD_OF_DEPARTMENT`, `BRANCH_MANAGER`, `BRANCH_OPERATIONS_MANAGER`, `DIRECTOR`, `SUPERVISOR`.

So an officer in the Admin Unit holds role `OFFICER`, matches the `OFFICER` case, and sees **only
their own requests** — the opposite of the intent. The branch of code written to make them superior
is unreachable unless somebody hand-creates a role named exactly `ADMIN_OFFICER`.

This is also why the seniority cannot be expressed today: it was modelled on a **role name that does
not exist**, while the thing that does exist — the unit — carries no authority at all.

### 2.5 Unit membership is not verified when acting

`WorkflowEngineService.processStepAction(requestId, actorId, action, comment)` records the actor and
advances the step. It never checks that the actor belongs to `request.currentUnit`. The endpoint is
guarded by `APPROVE_REQUEST`, so this is not open to everyone — but **any holder of that permission
can act on a step routed to a unit they are not in**.

---

## 3. Options

Three ways to give the two units real standing. They are not exclusive; (a) is the smallest and (c)
the most faithful to how the bank actually works.

### (a) Roles named for the job — no new concept

Seed `ADMIN_OFFICER` and `INFRA_OFFICER` as roles and grant them the wider permission set. The
existing `determineUserRole` cases would start firing.

- **For:** no new mechanism; works today.
- **Against:** entrenches the role-name model we are retiring, and duplicates a fact the unit already
  records. A person would carry both "Admin Unit" and "ADMIN_OFFICER", free to disagree.

### (b) Grant the seniority as permissions, ignore the unit

Give the individuals the wider permissions directly (`DASH_SCOPE_ALL`, `RECEIVE_ASSET_IN_STORE`,
`ISSUE_ITEMS`, …) through an **additional role** — the mechanism already exists and the login
response already carries `additionalRoles`.

- **For:** fits the model we have been building; no code at all, only configuration.
- **Against:** the seniority is invisible as a *concept* — you cannot ask "who are the Admin Unit
  officers" and get it from permissions. Joiners must be granted by hand.

### (c) Make the unit a permission-bearing group *(recommended)*

Give `Unit` a `Set<Role>` — the same shape `User.additionalRoles` already has — and add unit roles to
the effective permission set in `User.getAuthorities()`:

```
effective = title.role.permissions
          ∪ additionalRoles[].permissions
          ∪ unit.roles[].permissions        ← new
```

- **For:** the unit becomes the thing that confers seniority, which is what the bank means. Adding a
  person to Admin Unit grants it; removing them revokes it. One place to configure, and it composes
  with the two axes rather than competing with them.
- **Against:** touches `getAuthorities()`, which everything depends on; needs a migration and a
  Settings screen for unit roles.
- **Note:** `User.getAuthorities()` is already the single source for both axes, so this is an
  extension of an existing seam rather than a new one.

### And regardless of which — close 2.5

Acting on a unit-routed step should verify the actor is in that unit. Cheap, and it is the one place
where units already carry authority that is not enforced.

---

## 4. Recommendation

**(c)**, with **(b)** as the interim: grant the wider permissions through an additional role now so
the two units work correctly today, and move that grant onto the unit when (c) lands. Nothing has to
be undone — an additional role and a unit role resolve through the same union.

Do **not** do (a). It adds a second role name for a person who already has one, and the role-name
model is the thing we are retiring.

---

## 5. Before deciding, worth confirming with the bank

1. Is the seniority **unit-wide** (everyone in Admin Unit outranks a branch officer), or **role-wise
   within the unit** (an Admin Unit *manager* does, an Admin Unit *officer* does not)?
2. Does it extend to **asset actions** — should an Admin Unit officer be able to dispose or reassign
   an asset in a branch — or only to **requests and issuance**?
3. Do Admin and Infra differ from each other, or are they peers with different subject matter
   (Admin = general/stationery, Infra = IT)?

Question 2 matters most for the assets page: today the answer is "no difference at all", and if the
bank expects otherwise, that is a functional gap rather than a permissions bug.
