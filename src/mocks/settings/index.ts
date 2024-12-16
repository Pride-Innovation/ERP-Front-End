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

const tesroles = [
    {
        "id": 1,
        "name": "Super Admin",
        "guard_name": "api",
        "created_at": null,
        "updated_at": null,
        "permissions": [
            {
                "id": 2,
                "name": "view",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 1,
                    "permission_id": 2
                }
            },
            {
                "id": 3,
                "name": "update",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 1,
                    "permission_id": 3
                }
            },
            {
                "id": 4,
                "name": "create",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 1,
                    "permission_id": 4
                }
            },
            {
                "id": 5,
                "name": "delete",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 1,
                    "permission_id": 5
                }
            }
        ]
    },
    {
        "id": 2,
        "name": "Admin",
        "guard_name": "api",
        "created_at": null,
        "updated_at": null,
        "permissions": [
            {
                "id": 2,
                "name": "view",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 2,
                    "permission_id": 2
                }
            }
        ]
    },
    {
        "id": 3,
        "name": "Manager",
        "guard_name": "api",
        "created_at": null,
        "updated_at": null,
        "permissions": [
            {
                "id": 3,
                "name": "update",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 3,
                    "permission_id": 3
                }
            },
            {
                "id": 4,
                "name": "create",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 3,
                    "permission_id": 4
                }
            },
            {
                "id": 5,
                "name": "delete",
                "guard_name": "api",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 3,
                    "permission_id": 5
                }
            }
        ]
    }
]