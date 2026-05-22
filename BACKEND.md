# Spring Boot backend — Asset Categories, Custom Attributes & Role-Aware Approval Workflows

Paste this whole document into Claude (or hand it to a backend developer) inside the Spring Boot project repo.

---

## Context

We extended our React/TypeScript frontend across 5 phases to support:
1. **Asset Categories** (already exist as `AssetType`) get **custom attributes** and an **owner email group** for fulfilment notifications.
2. **Asset Requests** now pick a primary **Category** and submit values for that category's custom attributes.
3. **Approval Workflows** now match on **requester role** (RBAC) in addition to asset category and branch, and individual steps can be **skipped based on requester role**.
4. A new **workflow-resolve endpoint** lets the UI show requesters/admins exactly which workflow will run and which approvers will be notified, with fallback emails when the approver is unavailable.

Your job is to implement the backend changes that match this frontend contract. The frontend ships disabled until your endpoints exist, so wire things up in the order below and ship in PRs that mirror the phases.

This must be **non-breaking** — existing asset categories, requests, workflows and approval flows must continue to work unchanged when the new fields are absent or empty.

---

## Tech baseline (assume unless project differs)

- Spring Boot, JPA/Hibernate, Postgres, Flyway/Liquibase for migrations.
- DTOs separate from JPA entities; mapping with MapStruct or manual mappers.
- `IUser`, `Title`, `Role`, `Permission`, `Department`, `Branch`, `AssetType`, `Commodity`, `Request`, `RequestCommodity`, `ApprovalWorkflow`, `ApprovalWorkflowStep` already exist as entities.
- Multipart `POST /api/v1/requests` already accepts `priority`, `name`, `description`, `file`, `requestCommodities` (JSON string).
- All endpoints below are under `/api/v1` — adjust to match the project.

---

## Phase A — Asset Category: custom attributes + owner email

### Entity changes (`AssetType`)

Add two columns:

| Column | Type | Notes |
|---|---|---|
| `owner_group_email` | `varchar(255)` nullable | Email group notified to fulfil a request after approvals (e.g. `it-infra@bank` for Computer, `admin@bank` for Furniture). |

Add a **child table** `asset_type_custom_attribute`:

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `asset_type_id` | FK → `asset_type(id)`, cascade delete | |
| `key` | `varchar(80)` | Unique within parent. Slug: lowercase + `_`. |
| `label` | `varchar(120)` | Display label. |
| `data_type` | `varchar(16)` | Enum: `TEXT`, `NUMBER`, `DATE`, `BOOLEAN`, `SELECT`. |
| `options_json` | `text` nullable | JSON array of strings when `data_type = SELECT`, else null/empty. |
| `required` | `boolean` not null default false | |
| `display_order` | `int` not null | 1-based. |
| `helper_text` | `varchar(255)` nullable | |

Unique constraint: `(asset_type_id, key)`.

### DTO shapes (request & response)

`AssetTypeDTO` (extend existing):
```json
{
  "id": 12,
  "name": "Computer",
  "description": "...",
  "shortCode": "C",
  "ownerGroupEmail": "it-infra@bank.com",
  "fieldConfig": { /* existing — unchanged */ },
  "customAttributes": [
    {
      "id": 88,
      "key": "warranty_months",
      "label": "Warranty (months)",
      "dataType": "NUMBER",
      "options": null,
      "required": true,
      "order": 1,
      "helperText": "Vendor-supplied warranty period"
    },
    {
      "id": 89,
      "key": "form_factor",
      "label": "Form Factor",
      "dataType": "SELECT",
      "options": ["Laptop", "Desktop", "Workstation"],
      "required": false,
      "order": 2,
      "helperText": null
    }
  ]
}
```

### Endpoints

- `POST /api/v1/asset-types` — accept `ownerGroupEmail` (nullable string).
- `PUT /api/v1/asset-types/{id}` — accept `ownerGroupEmail` (nullable string).
- `GET /api/v1/asset-types` and `GET /api/v1/asset-types/{id}` — return `ownerGroupEmail` and `customAttributes` (ordered by `order`).
- **NEW** `PUT /api/v1/asset-types/{id}/custom-attributes` — request body: full array (replace semantics).
  - Validate: `key` is non-empty, slug-cased (`^[a-z0-9_]+$`), unique within payload.
  - Validate: `dataType = SELECT` ⇒ `options` non-empty.
  - Reassign `order` 1..n in payload order.
  - 200 OK, return updated `customAttributes` array.

### Notes

- `ownerGroupEmail` should validate as an email when present.
- Custom attributes are **definitions**, not values — values live on the Request (Phase B).

---

## Phase B — Asset Request: pick category + submit custom attribute values

### Entity changes (`Request`)

Add columns:

| Column | Type | Notes |
|---|---|---|
| `asset_type_id` | FK → `asset_type(id)` nullable | Primary category for the request — drives workflow resolution and which attributes apply. |
| `attributes_json` | `jsonb` (Postgres) nullable | Free-form `{ [key]: value }` map of attribute values. Keys must match `AssetTypeCustomAttribute.key` for the chosen category. |

### Endpoint changes

Both `POST /api/v1/requests` (multipart) and `PUT /api/v1/requests/{id}` (multipart) now accept two additional form fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `assetTypeId` | string (number) | optional for back-compat, **required going forward** | The chosen category. |
| `attributes` | string (JSON object) | optional | `{"warranty_months": 24, "form_factor": "Laptop"}`. |

Validation on save:
1. If `assetTypeId` provided, the category must exist.
2. If `attributes` is non-empty and `assetTypeId` is set, validate each key:
   - Must correspond to a defined `AssetTypeCustomAttribute.key` on that category.
   - Type-check the value against `dataType` (string for TEXT/SELECT, number for NUMBER, ISO date for DATE, boolean for BOOLEAN).
   - For SELECT, the value must be one of the configured `options`.
   - All `required: true` attributes for the category must be present.
3. If `assetTypeId` is omitted, accept but don't validate `attributes` (back-compat with older clients).

### Response shape

`GET /api/v1/requests/{id}` and `GET /api/v1/requests` return:
```json
{
  "id": 4011,
  "name": "New laptop for John",
  "priority": "high",
  "description": "...",
  "assetTypeId": 12,
  "assetType": { "id": 12, "name": "Computer", "shortCode": "C" },
  "attributes": { "warranty_months": 24, "form_factor": "Laptop" },
  "commodities": [ ... ],
  "status": { ... },
  "createDate": "...",
  ...
}
```

The frontend already reads `assetTypeId` and `attributes` straight from the response and feeds them into `useForm.reset(...)` — keep field names exactly as above (camelCase).

---

## Phase C — Approval Workflows: condition on requester role

### Entity changes

#### `ApprovalWorkflow`

Add a join table `approval_workflow_requester_role`:

| Column | Type |
|---|---|
| `workflow_id` | FK → `approval_workflow(id)`, cascade delete |
| `role_id` | FK → `role(id)` |

PK: `(workflow_id, role_id)`.

Semantic: a workflow with **zero** requester roles matches **any** requester. With one or more, the requester's role must intersect.

#### `ApprovalWorkflowStep`

Add a join table `approval_workflow_step_skip_role`:

| Column | Type |
|---|---|
| `step_id` | FK → `approval_workflow_step(id)`, cascade delete |
| `role_id` | FK → `role(id)` |

PK: `(step_id, role_id)`.

Semantic: if the requester's role intersects this set, the step is **skipped** during resolution.

### DTO shapes

`ApprovalWorkflowDTO` (extend existing):
```json
{
  "id": 7,
  "name": "IT Equipment — Head Office",
  "description": "...",
  "assetTypeIds": [12, 14],
  "assetTypeNames": ["Computer", "IT Equipment"],
  "branchId": null,
  "branchScope": "HEAD_OFFICE",
  "active": true,
  "priority": 10,
  "requesterRoleIds": [3, 4],
  "requesterRoleNames": ["Officer", "Senior Officer"],
  "steps": [
    {
      "id": 21,
      "stepOrder": 1,
      "stepName": "Acknowledge",
      "stepType": "ACKNOWLEDGE_REQUEST",
      "approverType": "DIRECT_SUPERVISOR",
      "groupEmail": "",
      "specificUserId": "",
      "notifyGroupEmail": "",
      "optional": false,
      "escalationHours": 48,
      "skipIfRequesterRoleIds": [5, 6]
    },
    ...
  ]
}
```

`requesterRoleNames` is **response-only** — populated by joining `role.name` for each `role_id`. The frontend uses it to render chips on the workflow list.

### Endpoint changes

- `POST /api/v1/approval-workflows` — accept `requesterRoleIds[]` + per-step `skipIfRequesterRoleIds[]`.
- `PUT /api/v1/approval-workflows/{id}` — same.
- `GET /api/v1/approval-workflows` and `GET /…/{id}` — return both `requesterRoleIds`, `requesterRoleNames` and per-step `skipIfRequesterRoleIds`.

No changes to `toggle-active` or `DELETE`.

### Existing dependencies (verify they exist as-is)

- `GET /api/v1/roles?pageNumber=0&pageSize=200` — returns `{ content: [...] }` of `RoleDTO { id, name, permissions: [...] }`. Frontend admin uses this to populate the role multi-select.
- `GET /api/v1/users?pageNumber=0&pageSize=10&name=...` — paginated user search filterable by full-name substring. Used by the admin "Test workflow" panel.

---

## Phase D — Workflow resolution endpoint (the keystone)

This is the most important new piece. Frontend uses it both:
- inline on the request form (to show the requester *"This goes to Jane Doe → Head of IT → it-infra@bank"*), and
- inside the workflow builder as a test harness.

### Endpoint

`GET /api/v1/approval-workflows/resolve`

Query parameters:

| Param | Required | Notes |
|---|---|---|
| `categoryId` | **yes** | The chosen Asset Category id. |
| `branchId` | optional | Defaults to the requester's branch when `requesterId` is given. |
| `requesterId` | optional | When omitted, return the matched workflow with no per-step approver resolution (just `approverType` labels). |

### Response shape

```json
{
  "workflowId": 7,
  "workflowName": "IT Equipment — Head Office",
  "fulfilmentGroupEmail": "it-infra@bank.com",
  "noMatchReason": null,
  "resolvedSteps": [
    {
      "stepOrder": 1,
      "stepName": "Acknowledge",
      "stepType": "ACKNOWLEDGE_REQUEST",
      "approverType": "DIRECT_SUPERVISOR",
      "approverName": "Jane Doe",
      "approverEmail": "jane.doe@bank.com",
      "fallbackEmail": "finance-managers@bank.com",
      "skipped": false,
      "skipReason": null,
      "optional": false
    },
    {
      "stepOrder": 2,
      "stepName": "Department Head Recommend",
      "stepType": "REQUEST_APPROVAL",
      "approverType": "DEPT_HEAD",
      "approverName": "Mary Akello",
      "approverEmail": "mary.akello@bank.com",
      "fallbackEmail": null,
      "skipped": true,
      "skipReason": "Requester is a Manager",
      "optional": false
    }
  ]
}
```

When no workflow matches, return **200 OK** with:
```json
{ "workflowId": null, "workflowName": null, "resolvedSteps": [], "noMatchReason": "No active workflow matches category=Computer, branch=Head Office, role=External Auditor" }
```

(Don't return 404 — the frontend distinguishes "couldn't fetch" from "no match" by the body.)

### Matching algorithm

```
candidates = all ApprovalWorkflow where active = true
            AND (assetTypeIds is empty OR assetTypeIds contains categoryId)
            AND (branchScope = ALL
                 OR (branchScope = HEAD_OFFICE AND branch is head office)
                 OR (branchScope = BRANCH AND branch is not head office)
                 OR (branchId is set AND workflow.branchId = branchId))
            AND (requesterRoleIds is empty
                 OR requesterRoleIds intersects requester.roleIds)

matched = candidates ordered by priority DESC, id ASC
chosen  = matched[0]   // or null
```

You'll need a way to identify "head office" — probably a flag on `Branch` (`is_head_office` boolean) or a `branch_type` enum. If that doesn't exist yet, add it.

### Per-step resolution

For each step in `chosen.steps` (ordered by `stepOrder`):

1. **Skip check:** if `step.skipIfRequesterRoleIds` intersects `requester.roleIds`, mark `skipped=true` with a human-readable `skipReason` (e.g. `"Requester is a Manager"` — pull the role name).
2. **Approver resolution** (when not skipped and `requesterId` is provided):

   | `approverType` | Resolution |
   |---|---|
   | `DIRECT_SUPERVISOR` | The user with the title that requester's title `reports_to` (chase 1 level). |
   | `DEPT_HEAD` | `requester.department.headOfDepartment`. |
   | `BOM` | `requester.branch.branchOperationsManager`. |
   | `BRANCH_MANAGER` | `requester.branch.branchManager`. |
   | `ADMIN` | The configured admin user/group — pick what matches your existing model (e.g. users with a specific role). |
   | `GROUP_EMAIL` | No user — `approverName=null`, `approverEmail=step.groupEmail`. |
   | `SPECIFIC_USER` | User with `id = step.specificUserId`. |

3. **Fallback email:**
   - For dept-managed approvers (DEPT_HEAD, DIRECT_SUPERVISOR within the same dept): `requester.department.managersGroupEmail`.
   - Otherwise: `step.notifyGroupEmail` (the existing CC field).
   - Null when neither applies.

4. **Unavailable approver:** if the resolved user is disabled / blocked / on leave, **still surface them** as `approverName` and put the fallback in `fallbackEmail` — the UI displays both. Don't auto-skip the step.

### Fulfilment email

`fulfilmentGroupEmail` = `chosen.assetType.ownerGroupEmail` for the matched category (Phase A). The UI shows it as a teal "Fulfilment: …" chip. When the workflow applies to multiple categories, return the email for the **requested** category (the query's `categoryId`).

### Notes

- This endpoint should be `@Cacheable`-friendly per (categoryId, branchId, requesterId) for ≤ 30s — requesters refresh the preview every keystroke.
- When `requesterId` is null, return the workflow + steps with `approverName=null`, `approverEmail=null` everywhere; only labels and skip flags fill in.

---

## Phase E — Acceptance criteria

A reviewer (or you) should be able to:

1. **Phase A**
   - Create a category "Computer" with `ownerGroupEmail = it-infra@bank.com`.
   - PUT 3 custom attributes — see them in `GET /asset-types/{id}` ordered correctly.
   - Try creating a duplicate `key` → 400 with a clear validation message.
   - Try a SELECT attribute with empty `options` → 400.

2. **Phase B**
   - Create a request with `assetTypeId=Computer` and `attributes={ warranty_months: 24, form_factor: "Laptop" }`. 201.
   - Try `attributes` with an unknown key → 400.
   - Try a required attribute missing → 400.
   - GET that request back → `assetTypeId`, `assetType`, `attributes` all present.

3. **Phase C**
   - Create a workflow with `requesterRoleIds=[Officer]` and a step with `skipIfRequesterRoleIds=[Manager]`. Persisted and returned correctly.
   - Echo back `requesterRoleNames` in responses.

4. **Phase D**
   - Seed: Officer at Head Office requesting a Computer.
     - `GET /approval-workflows/resolve?categoryId=…&requesterId=…` returns the Head Office IT workflow with steps resolved to the user's direct supervisor (by title chain), department head, and `fulfilmentGroupEmail=it-infra@bank.com`.
   - Same request from a Manager → step 1 (`DIRECT_SUPERVISOR`) shows `skipped=true`, `skipReason="Requester is a Manager"`.
   - Same request from a branch (not Head Office) → resolves a different workflow that includes BOM and Branch Manager steps.
   - Furniture category → resolves to a workflow whose `fulfilmentGroupEmail = admin@bank.com`.
   - Unsupported category for a role → 200 with `workflowId=null` and a `noMatchReason`.

5. **Phase D — auth/availability edge cases**
   - Disabled direct supervisor → still surfaced as the approver, with `fallbackEmail` set to the dept managers group.
   - Requester with no title / no department → returns the workflow with as much resolution as possible; null fields where unresolvable; never 500.

---

## Phase F — Data migration & seeding hints

- Make all new columns nullable initially; backfill defaults; only add NOT NULL constraints (where applicable) after backfill.
- Seed a couple of `customAttributes` on the existing Computer / Furniture categories so the QA team can demo the request flow end-to-end.
- Seed an `ownerGroupEmail` on every existing category (use a generic mailbox if unknown so the resolve endpoint always returns a fulfilment chip).
- If `Branch.is_head_office` doesn't exist, add it as a boolean column, set true for the single head-office row, false for the rest.

---

## Out of scope (intentional)

- No new entity for "approval chain history" — frontend reads existing `requestReports`.
- No notification/email sending changes in this batch — the resolve endpoint just **returns** the addresses to display; the existing notification code can pick them up later via the same DTOs.
- No GraphQL — REST only, matching the rest of the API.

---

## Frontend pointers (only if you need to verify shapes)

The frontend repo's contracts to mirror are:

- Asset Types: `src/pages/settings/assetTypes/interface.ts` — `IAssetType`, `ICustomAttribute`, `CustomAttributeDataType`.
- Requests: `src/pages/request/interface.ts` — `IRequest` now carries `assetTypeId`, `assetType`, `attributes`.
- Workflows: `src/pages/approvalWorkflows/interface.ts` — `IApprovalWorkflow`, `IApprovalStep`, `IResolvedApprovalWorkflow`, `IResolvedApprovalStep`. **The resolve endpoint must match `IResolvedApprovalWorkflow` exactly.**

The frontend already type-checks against these, so any drift in field names or shape will be obvious as soon as the UI hits the endpoints.

---

End of prompt.
