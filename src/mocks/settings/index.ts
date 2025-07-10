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
    { "id": 1, "name": "READ_PERMISSION" },
    { "id": 2, "name": "CREATE_PERMISSION" },
    { "id": 3, "name": "UPDATE_PERMISSION" },
    { "id": 4, "name": "DELETE_PERMISSION" },
    { "id": 5, "name": "READ_ROLE" },
    { "id": 6, "name": "CREATE_ROLE" },
    { "id": 7, "name": "UPDATE_ROLE" },
    { "id": 8, "name": "DELETE_ROLE" },
    { "id": 9, "name": "CREATE_USER" },
    { "id": 10, "name": "READ_USER" },
    { "id": 11, "name": "UPDATE_USER" },
    { "id": 12, "name": "DELETE_USER" },
    { "id": 13, "name": "READ_REQUEST" },
    { "id": 14, "name": "CREATE_REQUEST" },
    { "id": 15, "name": "DELETE_REQUEST" },
    { "id": 16, "name": "UPDATE_REQUEST" },
    { "id": 17, "name": "CREATE_STATUS" },
    { "id": 18, "name": "DELETE_STATUS" },
    { "id": 19, "name": "UPDATE_STATUS" },
    { "id": 52, "name": "READ_TRANSPORT" },
    { "id": 53, "name": "CREATE_TRANSPORT" },
    { "id": 54, "name": "DELETE_TRANSPORT" },
    { "id": 55, "name": "UPDATE_TRANSPORT" },
    { "id": 56, "name": "READ_INVENTORY" },
    { "id": 57, "name": "CREATE_INVENTORY" },
    { "id": 58, "name": "DELETE_INVENTORY" },
    { "id": 59, "name": "UPDATE_INVENTORY" },
    { "id": 60, "name": "READ_SETTING" },
    { "id": 61, "name": "CREATE_SETTING" },
    { "id": 62, "name": "DELETE_SETTING" },
    { "id": 63, "name": "UPDATE_SETTING" },
    { "id": 64, "name": "READ_AUDIT" },
    { "id": 65, "name": "CREATE_AUDIT" },
    { "id": 66, "name": "DELETE_AUDIT" },
    { "id": 67, "name": "UPDATE_AUDIT" },
    { "id": 68, "name": "READ_STORE" },
    { "id": 69, "name": "CREATE_STORE" },
    { "id": 70, "name": "DELETE_STORE" },
    { "id": 71, "name": "UPDATE_STORE" },
    { "id": 72, "name": "READ_ASSET" },
    { "id": 73, "name": "CREATE_ASSET" },
    { "id": 74, "name": "DELETE_ASSET" },
    { "id": 75, "name": "UPDATE_ASSET" }
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