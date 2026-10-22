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






Response 

Recommended approach
1. Branch store → user goes through the request. A branch issuer issues from the branch store. Replace "Stationery only" with "whatever this branch store holds": the stocking rules already decide what a branch may hold. Keep the manual transfer for exceptions.
- Perfect recommendation. I need to know how the system will notice that the request can be handled at branch level and the request does not reach office when the items requested for exist on the branch level.
- The idea of using the stocking rule is perfect to know what items can be stocked at a branch level, but please notice that an item may not be stock at branch level but still can be replenished from head office. Please confirm if this what the system implements. Meaning that an item may not be stocked at branch level but if it was requested from head office and it was replenished to the destination branch then it should still be handled from branch level.
- The idea for what you termed as manual transfer "That is a transfer without a request" is when user with permission tries to give users commodities without request. Like if we notice that a user or department (in case of head office) is running off stationery, then we can give them some but like you suggested we can keep them for exceptions. 

2. A replenishment request ends in the branch Admin store, so the stock is shelved there rather than counted as used by the BOM.
- This is a very interesting one because there are also scenarios where a BM or BOM is requesting for personal assets. How does the system identify that the BOM requests is to stock the store or its personal. My suggestion would be to have like a check box that is guarded by permission for example. When a user has  a permission to "restock store" then he can view this check box. So a BOM and BM can have this permission. When the checkbox is checked, then that request is for the store and not personal. This makes it more interesting, when a user is requesting for both store and for personal use. Please let me know what the system does at the moment and how you had planned to achieve this. 

3. Deduct issued stock when the issuance is approved, not when the items are issued, or put it back on rejection. Moving the deduction to approval is cleaner.
- I agree with this.
4. Reserve stock when a movement or issue is created. Available = on hand − already promised, checked by the server, with the form showing the same figure.
- I totally agree with this also
5. Check asset lines on the server: the asset is in the source store, isn't on another open movement, and isn't a loaner, under repair, or awaiting completion.
- I totally agree with this also. Please also ensure that asset is also not assigned to any other user. 
6. Look up Head Office by its flag, not by id 1.
- I totally agree with this. 

 (c): should drawing stock out of a store be limited to people at that store's branch, with Head Office allowed to send anywhere?

- yes a user should be able to only draw items from their branch stores but they should also be able to send to other branches, but only draw from their branches. There are scenarios where a branch may be requested to send items to other nearby branches. Then they should be able to draw from their branches.


Second Feedback

1. a Stock is never consulted. That is why no branch store has ever issued anything, even Stationery sitting on Gulu's shelf.
My proposal: decide when the request reaches its Acknowledge step, after the branch approvals, not at submission. Stock can change while a request is being approved, and we don't want approvals skipped.
- What if we create a workflow for Branches, so that certain commodities that are in this work flow never reach head office and are issued by BOM, and the issuance is approved by BM. So that we can handle such commodities using the Branch Stores. These could include Stationery category and others that could be added to this workflow to make it flexible. For head office can remain the way it is and reach Admin. This would be my suggestion. 
- So that the BOM and BM (those with permissions) can then request from Head office to restock the branch store or also restock at the branch level since branches can also restock at branch levels. 
- That means a branch request for such commodities will only be processed at the branch level. If the items are not available in the Branch, the requester has t wait until the branch store is restocked by the two mentioned options above.
- here the issuer is the BOM and the approver is the BM. 

b. Is an item replenished to a branch issuable there even when stocking rules don't list it? Yes, the system already behaves that way.
 - This is very important because some commodities are only stocked at Head office so the only way branches can get them is through replenishing to other branches.

c. On exceptions (giving without a request). Please go with your recommendation here. 

2. Store restock vs personal requests.

- Lets us go with the checkbox approach as you also recommended.
- Then also "Store and personal items in one request should not be allowed". 


Questions before I start

1. Partially available at the branch: send the whole request to Head Office (my recommendation), or split it?
- I do not agree with this. When a request comes for an item that according to the workflow should be handled at the branch, it should always stop at the Branch until a BOM requests for a replenishment of the Branch Store. Then the branch store is restocked and the previous requests handled at branch levels.

2. IT categories: if Gulu holds the laptop, does Infra still need to acknowledge before the branch issues it? My suggestion is yes: Infra acknowledges and the branch issues.
- To be honest, the replenishment modal may be confusing for now that a Branch may hold such assets, but let us go with the workflow, if the workflow states that the request is to handled at Head Office, please send it to head office. Just the exact way it is. It is going to be a very rare or even never an occasion where those assets will be in the branch stores.

3. Restock at Head Office: show the checkbox only to branch users? Head Office would be restocking its own source.
- Yes.
4. Exceptions: happy with a new permission plus a required reason?
- Am happy with permissions since every action should be guarded with permissions.
5. For (c): should Admin and Infra, who have cross-branch inventory reach, be allowed to draw from a branch's store? I'd say no, the same as stock take: you draw only where you stand.
- totally agree
6. Confirm: no mixing store and personal items in one request.
- totally Agree


