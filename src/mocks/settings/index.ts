/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IPermission, IRole } from "../../pages/settings/interface";
import { ISupplier } from "../../pages/settings/suppliers/interface";


export const suppliersMock: Array<ISupplier> = [
    {
        id: 1,
        name: "Alican & Sons",
        telephone: "+1 345 2341426",
        email: "alicomsons@test.gmail.com",
        address: "Gulu City",
        commodity: {
            "id": 1,
            "name": "Pens",
            "groupName": "Box",
            "assetType": {
                "id": 3,
                "name": "Stationery",
                "description": "Stationery"
            }
        },
    }
]

export const permissionsMock: IPermission[] = [
    { index: 0, id: 1, name: "READ_PERMISSION" },
    { index: 1, id: 2, name: "CREATE_PERMISSION" },
    { index: 2, id: 3, name: "UPDATE_PERMISSION" },
    { index: 3, id: 4, name: "DELETE_PERMISSION" },
    { index: 4, id: 5, name: "READ_ROLE" },
    { index: 5, id: 6, name: "CREATE_ROLE" },
    { index: 6, id: 7, name: "UPDATE_ROLE" },
    { index: 7, id: 8, name: "DELETE_ROLE" },
    { index: 8, id: 9, name: "CREATE_USER" },
    { index: 9, id: 10, name: "READ_USER" },
    { index: 10, id: 11, name: "UPDATE_USER" },
    { index: 11, id: 12, name: "DELETE_USER" },
    { index: 12, id: 13, name: "READ_REQUEST" },
    { index: 13, id: 14, name: "CREATE_REQUEST" },
    { index: 14, id: 15, name: "DELETE_REQUEST" },
    { index: 15, id: 16, name: "UPDATE_REQUEST" },
    { index: 16, id: 17, name: "CREATE_STATUS" },
    { index: 17, id: 18, name: "DELETE_STATUS" },
    { index: 18, id: 19, name: "UPDATE_STATUS" },
    { index: 19, id: 20, name: "READ_TRANSPORT" },
    { index: 20, id: 21, name: "CREATE_TRANSPORT" },
    { index: 21, id: 22, name: "DELETE_TRANSPORT" },
    { index: 22, id: 23, name: "UPDATE_TRANSPORT" },
    { index: 23, id: 24, name: "READ_INVENTORY" },
    { index: 24, id: 25, name: "CREATE_INVENTORY" },
    { index: 25, id: 26, name: "DELETE_INVENTORY" },
    { index: 26, id: 27, name: "UPDATE_INVENTORY" },
    { index: 27, id: 28, name: "READ_SETTING" },
    { index: 28, id: 29, name: "CREATE_SETTING" },
    { index: 29, id: 30, name: "DELETE_SETTING" },
    { index: 30, id: 31, name: "UPDATE_SETTING" },
    { index: 31, id: 32, name: "READ_AUDIT" },
    { index: 32, id: 33, name: "CREATE_AUDIT" },
    { index: 33, id: 34, name: "DELETE_AUDIT" },
    { index: 34, id: 35, name: "UPDATE_AUDIT" },
    { index: 35, id: 36, name: "READ_STORE" },
    { index: 36, id: 37, name: "CREATE_STORE" },
    { index: 37, id: 38, name: "DELETE_STORE" },
    { index: 38, id: 39, name: "UPDATE_STORE" },
    { index: 39, id: 40, name: "READ_ASSET" },
    { index: 40, id: 41, name: "CREATE_ASSET" },
    { index: 41, id: 42, name: "DELETE_ASSET" },
    { index: 42, id: 43, name: "UPDATE_ASSET" },
    { index: 43, id: 44, name: "APPROVE_REQUEST" },
    { index: 44, id: 45, name: "REJECT_REQUEST" },
    { index: 45, id: 46, name: "ISSUE_ITEMS" },
    { index: 46, id: 47, name: "ACKNOWLEDGE_REQUEST" },
    { index: 47, id: 48, name: "APPROVE_ISSUANCE" }
];

export const rolesMock: IRole[] = [
    {
        id: 1,
        name: "System Administrator",
        permissions: [
            { id: 1, name: "read_users" },
            { id: 2, name: "create_users" },
            { id: 5, name: "update_it_equipment" },
            { id: 6, name: "create_it_equipment" },
            { id: 7, name: "delete_it_equipment" },
            { id: 8, name: "read_it_equipment" },
            { id: 10, name: "create_office_equipment" },
            { id: 11, name: "delete_office_equipment" },
            { id: 12, name: "read_office_equipment" },
            { id: 13, name: "update_fleet" },
            { id: 14, name: "create_fleet" },
            { id: 16, name: "read_fleet" },
        ]
    },
    {
        id: 2,
        name: "Admin Officer",
        permissions: [
            { id: 1, name: "read_users" },
            { id: 2, name: "create_users" },
            { id: 3, name: "delete_users" },
            { id: 4, name: "update_users" },
            { id: 5, name: "update_it_equipment" },
            { id: 6, name: "create_it_equipment" },
            { id: 8, name: "read_it_equipment" },
            { id: 10, name: "create_office_equipment" },
            { id: 11, name: "delete_office_equipment" },
            { id: 12, name: "read_office_equipment" },
            { id: 13, name: "update_fleet" },
            { id: 14, name: "create_fleet" },
            { id: 15, name: "delete_fleet" },
            { id: 16, name: "read_fleet" },
        ]
    },
    {
        id: 3,
        name: "ICT Officer",
        permissions: [
            { id: 1, name: "read_users" },
            { id: 2, name: "create_users" },
            { id: 3, name: "delete_users" },
            { id: 4, name: "update_users" },
            { id: 6, name: "create_it_equipment" },
            { id: 7, name: "delete_it_equipment" },
            { id: 8, name: "read_it_equipment" },
            { id: 9, name: "update_office_equipment" },
            { id: 10, name: "create_office_equipment" },
            { id: 12, name: "read_office_equipment" },
            { id: 13, name: "update_fleet" },
            { id: 14, name: "create_fleet" },
            { id: 16, name: "read_fleet" },
        ]
    },
    {
        id: 4,
        name: "Finance Officer",
        permissions: [
            { id: 1, name: "read_users" },
            { id: 3, name: "delete_users" },
            { id: 4, name: "update_users" },
            { id: 5, name: "update_it_equipment" },
            { id: 8, name: "read_it_equipment" },
            { id: 9, name: "update_office_equipment" },
            { id: 12, name: "read_office_equipment" },
            { id: 13, name: "update_fleet" },
            { id: 15, name: "delete_fleet" },
            { id: 16, name: "read_fleet" },
        ]
    },
    {
        id: 5,
        name: "Officer",
        permissions: [
            { id: 1, name: "read_users" },
            { id: 3, name: "delete_users" },
            { id: 4, name: "update_users" },
            { id: 7, name: "delete_it_equipment" },
            { id: 9, name: "update_office_equipment" },
            { id: 10, name: "create_office_equipment" },
            { id: 11, name: "delete_office_equipment" },
            { id: 13, name: "update_fleet" },
            { id: 16, name: "read_fleet" },
        ]
    },
    {
        id: 6,
        name: "Supervisor",
        permissions: [
            { id: 2, name: "create_users" },
            { id: 3, name: "delete_users" },
            { id: 5, name: "update_it_equipment" },
            { id: 6, name: "create_it_equipment" },
            { id: 7, name: "delete_it_equipment" },
            { id: 9, name: "update_office_equipment" },
            { id: 11, name: "delete_office_equipment" },
            { id: 12, name: "read_office_equipment" },
            { id: 13, name: "update_fleet" },
            { id: 16, name: "read_fleet" },
        ]
    }
];