/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IPermission, IRole } from "../../pages/settings/interface";

export const permissionsMock: IPermission[] = [
    {
        "id": 2,
        "name": "CREATE_PERMISSION"
    },
    {
        "id": 6,
        "name": "CREATE_ROLE"
    },
    {
        "id": 17,
        "name": "CREATE_STATUS"
    },
    {
        "id": 10,
        "name": "READ_USER"
    },
    {
        "id": 4,
        "name": "DELETE_PERMISSION"
    },
    {
        "id": 12,
        "name": "DELETE_USER"
    },
    {
        "id": 13,
        "name": "READ_REQUEST"
    },
    {
        "id": 8,
        "name": "DELETE_ROLE"
    },
    {
        "id": 16,
        "name": "UPDATE_REQUEST"
    },
    {
        "id": 11,
        "name": "UPDATE_USER"
    },
    {
        "id": 5,
        "name": "READ_ROLE"
    },
    {
        "id": 1,
        "name": "READ_PERMISSION"
    },
    {
        "id": 15,
        "name": "DELETE_REQUEST"
    },
    {
        "id": 19,
        "name": "UPDATE_STATUS"
    },
    {
        "id": 7,
        "name": "UPDATE_ROLE"
    },
    {
        "id": 9,
        "name": "CREATE_USER"
    },
    {
        "id": 3,
        "name": "UPDATE_PERMISSION"
    },
    {
        "id": 14,
        "name": "CREATE_REQUEST"
    },
    {
        "id": 18,
        "name": "DELETE_STATUS"
    }
]

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