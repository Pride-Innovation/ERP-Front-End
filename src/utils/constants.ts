/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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