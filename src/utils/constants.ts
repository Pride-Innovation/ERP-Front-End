/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IOptions } from "../components/tables/interface";

export const availability = {
    available: "available",
    on_leave: "on leave"
}

export const ErrorMessage = "Something went wrong, Please Try Again Later!!";

export const crudStates: {
    create: string;
    update: string;
    read: string;
    delete: string;
    dispose: string;
    deactivate: string;
    disable: string;
    unblock: string;
    approve: string;
    reject: string;
    issue: string;
    download: string;
    upload: string;
    acknowledgeRequest: string;
    acknowledgeReceipt: string;
    approveIssuance: string;
    reassign: string;
    repair: string;
    inStore: string;
    enable: string;
    block: string;
    /** Fill in engraved number + remaining details for a newly-stocked asset. */
    complete: string;
    /** Record a physical delivery against a stock order (credits the store, registers assets, issues a GRN). */
    receiveDelivery: string;
} = {
    create: "create",
    update: "update",
    read: "read",
    delete: "delete",
    dispose: "dispose",
    deactivate: "deactivate",
    disable: "disable",
    unblock: "unblock",
    approve: "approve",
    reject: "reject",
    issue: "issue",
    download: "download",
    upload: "upload",
    acknowledgeRequest: "acknowledgeRequest",
    acknowledgeReceipt: "acknowledgeReceipt",
    approveIssuance: "approveIssuance",
    reassign: "reassign",
    repair: "repair",
    inStore: "inStore",
    enable: "enable",
    block: "block",
    complete: "complete",
    receiveDelivery: "receiveDelivery",
}

export const requestStatus: {
    pending: string;
    approved: string;
    rejected: string;
    normal: string;
} = {
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    normal: "normal"
}

/**
 * Request-status *codes* grouped by lifecycle stage. Ids are resolved at runtime from the loaded
 * status catalogue (see `statusIdsByCodes` in utils/helpers) — never hardcode ids, since seeded
 * ids vary by environment. Codes, by contrast, are stable across re-seeds.
 *
 * A request in any of the workflow-approval codes has advanced past one approval stage and is
 * awaiting the next, so listing/pending views must include them or a request vanishes the moment
 * it advances past the first step.
 */
export const WORKFLOW_APPROVAL_CODES: ReadonlyArray<string> = [
    'managerApproved',
    'hodApproved',
    'bomApproved',
    'branchManagerApproved',
    'supervisorApproved',
    'unitAcknowledged',
];

/** "Approved at some stage, awaiting the next" — the in-progress approval chain (Pending tab). */
export const PENDING_REQUEST_CODES: ReadonlyArray<string> = ['requestApproved', ...WORKFLOW_APPROVAL_CODES];

/** Post-issuance states — awaiting issuance approval / receipt acknowledgement (Issued tab). */
export const ISSUED_REQUEST_CODES: ReadonlyArray<string> = ['issued', 'issuanceApproved', 'receiptAcknowledged'];

/** Every request lifecycle state — the "All" view. */
export const ALL_REQUEST_CODES: ReadonlyArray<string> = [
    'requestCreated',
    'requestRejected',
    ...PENDING_REQUEST_CODES,
    ...ISSUED_REQUEST_CODES,
];

export const assetStatus: {
    use: string;
    store: string;
    repair: string;
    disposed: string;
    active: string;
} = {
    use: "use",
    store: "store",
    repair: "repair",
    disposed: "disposed",
    active: 'active'
}


/**
 * @deprecated These category names no longer exist.
 *
 * Asset categories became configurable (Settings → Asset Categories) and the seed now defines
 * twelve of them: "IT Equipment" is now "Computers", "Office Equipment" split into "Furniture"
 * and "Equipment", and "Fleet" is "Vehicle/Fleet". Only "Stationery" survives by name. Every
 * comparison against these values therefore fails silently and takes the fallback branch.
 *
 * The dashboard no longer reads this — it derives categories from the AssetType store (see
 * `pages/dashboard/categories.ts`). Two callers still do, and both need the same treatment:
 *
 *   - `components/tables/utills.tsx` — also carries hardcoded `assetTypeId` values (2, 1, 55)
 *     that are environment-specific ids, not stable identifiers.
 *   - `pages/assets/general/formUtills.tsx`
 *
 * Fix those by looking the category up in the AssetType store by id, then delete this.
 */
export const assetTypesStatusConstants: {
    itEquipment: string;
    officeEquipment: string;
    fleet: string;
    stationery: string;
} = {
    itEquipment: "IT Equipment",
    officeEquipment: "Office Equipment",
    fleet: "Fleet",
    stationery: "Stationery"
}

export const unitsOfMeasure: IOptions[] = [
    { label: "Pieces", value: "pieces" },
    { label: "Dozens", value: "dozens" },
    { label: "Boxes", value: "boxes" },
    { label: "Reams", value: "reams" }
];