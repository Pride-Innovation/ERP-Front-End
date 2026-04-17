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
    block: "block"
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