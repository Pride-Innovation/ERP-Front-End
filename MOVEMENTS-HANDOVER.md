# Movements & Consignments — Working Notes

Handover notes for the movement/consignment work. Spans **both** repos: `ERP-Front-End` and
`ERP-Back-End`.

This deliberately records only what the code *cannot* tell you: decisions and why they were made,
questions still open, and things deferred on purpose. What was built is in the code and its
comments — don't duplicate that here.

Last updated: 2026-08-07.

---

## Where things stand

Four workstreams implemented, backend compiling, **40 backend tests passing**, frontend typechecking
and linting clean. **None of it has been verified end-to-end against a running server** — that
testing run is in progress.

| # | Workstream | State |
|---|---|---|
| WS3 | Approval enforcement | Done |
| WS2 | Disposal gating, single disposal path | Done |
| WS1 | Repair-flow previews, autocompletes, derived fields | Done |
| WS4 | Consignment model | Done, mid-testing |

### Migrations applied

`V12__consignments.sql`, `V13__fix_consignment_landing_store_fk.sql`.

Both were applied to the dev database by running the test suite — `@SpringBootTest` boots Flyway on
context startup. Worth remembering: **running the tests migrates your dev database.**

---

## Decisions made, and why

**One movement per request.** A request used to produce two movements (HO → branch store, then an
auto-created branch store → requester). A `Consignment` now owns the journey, so the movement runs
source → requester throughout and the branch stop is an event on the consignment. `maybeCreateDeliveryLeg`
was deleted.

**Consignments carry movements from different source stores, and run in either direction.** Confirmed
by the user: IT and Admin can load the same van, and a branch can dispatch to Head Office.

**The ledger has three hops.** In transit → source stores to courier. Arrival → courier to
destination Admin store (this is the branch receipt). Movement completion → destination store to the
recipient. `MovementService#debitSourceFor` picks the right one.

**`requiresApproval` is derived, not chosen.** It was a create-form switch defaulting to off, so a
cross-location movement could skip approval entirely. Now: request-carrying movements are exempt
(the request cleared its own workflow), repair/return flows opt in explicitly, everything else
crossing a location boundary requires it.

**An unresolvable approval chain fails creation.** It used to fall through to `INITIATED` silently,
so a movement flagged as needing approval proceeded with none. See the open question below — the user
wants this softened.

**Bulk hand-over names its movements explicitly.** `POST /consignments/{id}/receive` requires the
list rather than defaulting to "all". Receiving assigns assets to a named person and draws stock from
a store; "everything unless stated otherwise" is the wrong default for that.

**Disposal is one path.** `POST /assets/{id}` (flag-only, no movement) was removed; the asset-page
Dispose now raises a real `DISPOSAL_TRANSFER`. Early disposal is allowed with a mandatory reason.

**Per-GRN status was left alone** (earlier decision, still holds) so current stock can always be
regenerated.

---

## Open questions — need answers before more code

### 1. Approval on request-driven movements — UNRESOLVED

The user said: *"a movement that comes from a request does not require any more approval… but the
admin creating this movement will definitely need an approval from his manager."*

Those two halves contradict each other, and it was never settled. Two readings:

- **A** — request movements *do* need approval, just the admin's own ladder rather than a re-run of
  the request workflow. Current code is then wrong (it exempts anything carrying a request).
- **B** — the contrast is with *manually created* movements. Current code is then right.

The user leaned towards testing first and deciding from experience. **If a request-driven movement
reaching dispatch with nobody signing off feels wrong in practice, that's Reading A.**

Complication worth remembering: nobody actually "creates" these — `FulfillmentService` generates them
inside the issuance-approval transaction, and the `initiator` ends up being whoever approved the
issuance.

**Design question attached to it:** with consignments, should approval sit on the *consignment*
rather than the movement? Five request movements in one van should plausibly be one approval
("this van goes to Mbarara today"), not five.

### 2. `reportsTo` hard-fail should become a modal

The user wants: instead of blocking when no approver resolves, prompt *"No approver found — proceed
anyway?"*

Agreed in principle. **Recommendation on record:** keep the modal but *record* the outcome — flag the
movement as "proceeded without approval", store who confirmed, show a badge. The original bug wasn't
that it proceeded; it's that it proceeded invisibly.

Note the chain resolves from **branch + title ladder + a ladder-role holder in that branch who isn't
you** — not a per-user `reportsTo` field.

### 3. Movement permissions do not exist

There are **no** `READ_MOVEMENT`-style permissions, and **no `@PreAuthorize` on any movement or
consignment endpoint**. The frontend routes guard on `READ_ASSET`; the API is open to any
authenticated user.

Plan agreed but not implemented:

1. Add `READ_/CREATE_/UPDATE_/DELETE_MOVEMENT` (`UPDATE_` covers the ledger-critical dispatch /
   in-transit / arrive / receive).
2. Create a `STORES_OFFICER`-style role carrying them; grant per-user via **`User.additionalRoles`**
   (already exists, unions into `getAuthorities()`). **Do not** add them to `OFFICER` — that grants
   every officer.
3. Add `@PreAuthorize` and repoint the route guards.

Rejected: scoping by **unit**. Unit is org structure, not authority — invisible on the permissions
screen and breaks on transfer.

**Timing caution:** adding `@PreAuthorize` before the seed grants the role will lock the user out of
their own testing.

### 4. Consignment listings are not branch-scoped

Movements are; consignments are not. `ConsignmentController.list` takes an optional `branchId` with
no `BranchScopeService` applied, so any authenticated user sees every journey. Inconsistent, and
introduced by this work. Decide alongside item 3.

---

## Known gaps, deliberately not done

- **Nothing prompts consolidation.** No *"3 movements are waiting for Mbarara — open a
  consignment?"* panel. The feature only pays off if an operator thinks to use it. Suggested:
  an "awaiting a journey" panel grouped by destination.
- **No way to mark an asset as pool stock at stocking time.** User explicitly said leave it — pool
  stock is only created via "Receive into Store" with the flag.
- **Service functions swallow error messages.** They `catch (error) { return error }`, returning an
  AxiosError, so `res?.data?.message` is `undefined` on any 4xx and components fall back to generic
  text. The real message is at `error.response.data.message`. **Every careful server-side error
  message we wrote is currently invisible in the UI.** Pre-existing, spans many files, worth fixing.
- **`UPLOAD_DIR` points at another project's public web root** (`assets-management/public/statics`).
  Reads are authenticated; writes still land in a `public/` folder.
- **`/requests` payload ~77KB.** Security aspect fixed (credentials no longer serialised); slimming
  deferred pending re-measurement.
- **`dateReceipt` is free text.** Disposal eligibility depends on it; blank or malformed values
  compute as age zero and read "In service" forever. Worth an audit before relying on the gate.

---

## Traps worth remembering

- **`Store` maps to `store_container`**, not `store`. A table called `store` also exists, which is
  why a wrong FK in V12 was accepted and only failed months later at runtime. Check `@Table` before
  writing a foreign key. `users` likewise, not `user`.
- **JPQL dotted paths are INNER joins.** `m.sourceStore.location.id = :x OR m.destStore…` silently
  returned nothing for every branch-scoped user, because no movement has all four associations
  non-null. Use explicit `LEFT JOIN`s for optional associations. Fixed in both
  `MovementRepository#findForBranch` and `ConsignmentRepository#findForBranch`.
- **Never edit an applied migration** — Flyway records its checksum and startup then fails
  validation. Add a new version instead.
- **`MovementRepository#findDetailById`, never `findById`.** Movement has nine EAGER associations and
  `Title.reportsTo` is EAGER and self-referencing; `findById` blows past MySQL's 61-table join limit.
- **Test-suite runs migrate the dev database.** `@SpringBootTest` boots Flyway.

---

## Testing status

A full end-to-end guide was produced covering: request fulfilment (cross-branch), consolidation of
multiple requests onto one consignment, lifecycle guards, repair transfer (IT / Admin / External /
non-repairable divert), temporary replacement, return after repair, disposal, return to store, and
manual create.

Bugs found and fixed *during* testing, all worth re-checking after any refactor:

1. `findForBranch` inner joins — every branch-scoped user saw an empty movement list.
2. `landing_store_id` FK pointed at the wrong table — arrival rolled back with a 409.
3. No dispatch UI existed for consignments at all.
4. No hand-over UI after arrival.
5. `assetTypeId` was a required query param, breaking cross-category engraved-number search.
6. `MissingServletRequestParameterException` → 403 (now 400); `IllegalStateException` → 403
   (now 409 — this one made every lifecycle guard look like a permissions error).

**Still unverified:** the full three-hop ledger walked end to end with a real consumable. That is the
single most valuable thing left to do.
