# Request Workflow — Creation Guide

A workflow defines the chain of approvals a request must traverse, from the
moment an officer raises it until the requester acknowledges receipt of the
issued items. Workflows are created under **Settings → Approval Workflows**.

The same workflow shape covers every asset category (Computers, Furniture,
Fleet, IT Equipment, …). What differs between categories is only the
`Asset Categories` field on the workflow header and (sometimes) the static
fulfilment-unit email on the acknowledge / issue steps.

---

## 1. Prerequisites

Dynamic notifications only work when the source records have emails filled in.
Before creating any workflow:

1. **Departments** (`Settings → Departments`): set `Managers Group Email` for
   each Head Office department (e.g. IT → `it-managers@yourbank.com`).
2. **Branches** (`Settings → Branches`): set `Managers Group Email` for every
   branch (e.g. Kampala → `kampala-managers@yourbank.com`).
3. **Asset Categories**: confirm each category is assigned the correct
   fulfilment unit (Infrastructure vs Admin) so the right team receives
   acknowledge / issue notifications.

If any of these are blank the corresponding email is silently skipped at
runtime — no error, just no email.

---

## 2. Workflow fields

### Header (left panel)

| Field                       | Purpose                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Workflow Name               | Human-readable label (e.g. `Computers — Head Office`).                                                                               |
| Description                 | Free-text summary.                                                                                                                   |
| Asset Categories            | Multi-select. Categories this workflow applies to. Empty = applies to all.                                                           |
| Branch                      | Optional. Restricts the workflow to a single named branch.                                                                           |
| Branch Scope                | `All Branches` / `Head Office Only` / `Branch Only`. Decides which class of duty stations the workflow can match.                    |
| Applies to requester roles  | Optional. Empty = matches every requester role.                                                                                      |
| Priority                    | Integer. Lower number wins when several workflows match the same request.                                                            |
| Active                      | Toggle. Inactive workflows are skipped by the resolver.                                                                              |

### Step (right panel, one card per step)

| Field                       | Purpose                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Step Name                   | Human-readable label shown on the timeline.                                                                                                                                          |
| Step Type                   | `Approve Request`, `Acknowledge Request`, `Issue Asset`, `Acknowledge Receipt`. Drives email wording and status transitions.                                                         |
| Approver Type               | Who must act. Options: Direct Supervisor, Department Head, Branch Operations Manager, Branch Manager, Admin, Group Email, Specific User, **Requester**.                              |
| Group Email                 | Shown only when Approver Type = `Group Email`. Static team mailbox (e.g. `infrastructure@yourbank.com`).                                                                             |
| Specific User ID            | Shown only when Approver Type = `Specific User`.                                                                                                                                     |
| CC / Notify whom            | How the CC mailbox is resolved. Options: `Requester's managers group (dynamic)`, `Requester`, `Requester's direct supervisor`, `Admin`, `Specific email address`, `No CC`.            |
| CC Email Address            | Shown only when CC / Notify whom = `Specific email address`.                                                                                                                         |
| Notify on completion        | Multi-select. Recipients emailed when the step is completed. Options: Requester, Requester's direct supervisor, Requester's managers group, Admin.                                   |
| Escalation (hrs)            | Hours before the step is escalated. `0` disables escalation.                                                                                                                         |
| Skip if requester role      | Multi-select of role ids. If the requester holds any of these roles the step is skipped (e.g. skip "Direct Supervisor" when a Manager raises their own request).                     |
| Optional                    | Toggle. Optional steps don't block the workflow if the approver fails to act within the escalation window.                                                                           |

### Dynamic resolution at runtime

| Source                          | Resolves to                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Direct Supervisor               | The user whose title is `requester.title.reportsTo`, **filtered to the same branch** as the requester.                                  |
| Department Head                 | `requester.department.headOfDepartment`.                                                                                               |
| Branch Operations Manager       | `requester.branch.branchOperationsManager`.                                                                                            |
| Branch Manager                  | `requester.branch.branchManager`.                                                                                                      |
| Admin                           | Configured by `application.admin.email`.                                                                                               |
| Requester                       | The user who raised the request.                                                                                                       |
| Requester's direct supervisor   | Same as Direct Supervisor above.                                                                                                       |
| Requester's managers group      | `requester.department.managersGroupEmail` when the requester is at Head Office, otherwise `requester.branch.managersGroupEmail`.       |

If a resolved approver is on leave and has an acting user assigned, the workflow
automatically routes to the acting user.

---

## 3. Workflow A — Computers (Head Office)

### Header

| Field            | Value                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Workflow Name    | `Computers — Head Office`                                                                            |
| Description      | HO flow for Computer requests. Officer → Manager → HoD → Infra → Issue → Issuance approval → Receipt. |
| Asset Categories | `Computers`                                                                                          |
| Branch           | *(blank)*                                                                                            |
| Branch Scope     | `Head Office Only`                                                                                   |
| Requester roles  | *(empty)*                                                                                            |
| Priority         | `10`                                                                                                 |
| Active           | `On`                                                                                                 |

### Steps

| # | Step Name                            | Step Type             | Approver Type      | Static Group Email           | CC / Notify whom                       | Notify on completion                 | Escalation | Skip if role                  |
| - | ------------------------------------ | --------------------- | ------------------ | ---------------------------- | -------------------------------------- | ------------------------------------ | ---------- | ----------------------------- |
| 1 | Manager Approval                     | Approve Request       | Direct Supervisor  | —                            | Requester's managers group (dynamic)   | —                                    | 48         | Manager, Head of Department   |
| 2 | HoD Recommendation                   | Approve Request       | Department Head    | —                            | Requester's managers group (dynamic)   | —                                    | 48         | Head of Department            |
| 3 | Infrastructure Acknowledges          | Acknowledge Request   | Group Email        | `infrastructure@yourbank.com`| No CC                                  | —                                    | 24         | —                             |
| 4 | Issue Asset                          | Issue Asset           | Group Email        | `infrastructure@yourbank.com`| No CC                                  | —                                    | 72         | —                             |
| 5 | Manager Approves Issuance            | Issue Asset           | Direct Supervisor  | —                            | Requester's managers group (dynamic)   | —                                    | 24         | —                             |
| 6 | Acknowledge Receipt                  | Acknowledge Receipt   | **Requester**      | —                            | No CC                                  | Admin, Requester's direct supervisor | 48         | —                             |

---

## 4. Workflow B — Computers (Branches)

Branches have no Head of Department; the chain replaces HoD with the Branch
Operations Manager and the Branch Manager.

### Header

| Field            | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Workflow Name    | `Computers — Branches`                                                                 |
| Description      | Branch flow for Computer requests. Officer → Manager → BOM → Branch Manager → Infra …  |
| Asset Categories | `Computers`                                                                            |
| Branch           | *(blank)*                                                                              |
| Branch Scope     | `Branch Only`                                                                          |
| Requester roles  | *(empty)*                                                                              |
| Priority         | `20`                                                                                   |
| Active           | `On`                                                                                   |

### Steps

| # | Step Name                            | Step Type             | Approver Type             | Static Group Email           | CC / Notify whom                       | Notify on completion                 | Escalation | Skip if role                                  |
| - | ------------------------------------ | --------------------- | ------------------------- | ---------------------------- | -------------------------------------- | ------------------------------------ | ---------- | --------------------------------------------- |
| 1 | Manager Approval                     | Approve Request       | Direct Supervisor         | —                            | Requester's managers group (dynamic)   | —                                    | 48         | Manager, BOM, Branch Manager                  |
| 2 | BOM Recommendation                   | Approve Request       | Branch Operations Manager | —                            | Requester's managers group (dynamic)   | —                                    | 48         | BOM, Branch Manager                           |
| 3 | Branch Manager Approval              | Approve Request       | Branch Manager            | —                            | Requester's managers group (dynamic)   | —                                    | 48         | Branch Manager                                |
| 4 | Infrastructure Acknowledges          | Acknowledge Request   | Group Email               | `infrastructure@yourbank.com`| No CC                                  | —                                    | 24         | —                                             |
| 5 | Issue Asset                          | Issue Asset           | Group Email               | `infrastructure@yourbank.com`| No CC                                  | —                                    | 72         | —                                             |
| 6 | Manager Approves Issuance            | Issue Asset           | Direct Supervisor         | —                            | Requester's managers group (dynamic)   | —                                    | 24         | —                                             |
| 7 | Acknowledge Receipt                  | Acknowledge Receipt   | **Requester**             | —                            | No CC                                  | Admin, Requester's direct supervisor | 48         | —                                             |

---

## 5. How the resolver picks a workflow

When a request is submitted, the engine matches active workflows on:

1. `assetTypeIds` (the request's category must be in the list, or the list must be empty).
2. `branchScope` vs. the requester's branch (HO vs. other).
3. `requesterRoleIds` (must be empty or contain one of the requester's roles).
4. `priority` (lowest number wins among the survivors).

Because HO and Branch workflows use mutually exclusive `branchScope` values
(`HEAD_OFFICE` vs `BRANCH`), a Computers request from an HO officer matches
**Workflow A** only, and one from a branch teller matches **Workflow B** only —
no collisions.

---

## 6. Replicating for other categories

To create the equivalent workflow for **Furniture**, **IT Equipment**, **Fleet**,
etc.:

1. Duplicate the header with a new `Workflow Name` and a different
   `Asset Categories` value.
2. Replace the static `Group Email` on the acknowledge / issue steps with the
   fulfilment unit that owns that category (e.g. `admin-team@yourbank.com` for
   Furniture).
3. Keep every other field identical.

All notification behaviour — dynamic CC, requester routing, completion fan-out —
applies uniformly across categories. No code change is needed to onboard a new
category; just create the workflow row.
