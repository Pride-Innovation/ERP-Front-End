/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IPermission, IRole } from "../../pages/settings/interface";

export const permissionsMock: IPermission[] = [
    { id: 1, name: "read_users" },
    { id: 2, name: "create_users" },
    { id: 3, name: "delete_users" },
    { id: 4, name: "update_users" },
    { id: 5, name: "update_it_equipment" },
    { id: 6, name: "create_it_equipment" },
    { id: 7, name: "delete_it_equipment" },
    { id: 8, name: "read_it_equipment" },
    { id: 9, name: "update_office_equipment" },
    { id: 10, name: "create_office_equipment" },
    { id: 11, name: "delete_office_equipment" },
    { id: 12, name: "read_office_equipment" },
    { id: 13, name: "update_fleet" },
    { id: 14, name: "create_fleet" },
    { id: 15, name: "delete_fleet" },
    { id: 16, name: "read_fleet" },
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