import { IPermission, IRole } from "../../pages/settings/interface";

export const permissionsMock: IPermission[] = [
    { id: 1, name: "Read User" },
    { id: 2, name: "Write User" },
    { id: 3, name: "Execute" },
    { id: 4, name: "Delete User" },
    { id: 5, name: "Update User" },
    { id: 6, name: "Create User" },
    { id: 7, name: "Manage Users" },
    { id: 8, name: "View Reports" },
    { id: 9, name: "Settings Access" },
    { id: 10, name: "API Access" }
];

export const rolesMock: IRole[] = [
    {
        id: 1,
        name: "System Administrator",
        permissions: [
            { id: 1, name: "Read User" },
            { id: 2, name: "Write User" },
            { id: 4, name: "Delete User" },
            { id: 5, name: "Update User" },
            { id: 6, name: "Create User" },
            { id: 7, name: "Manage Users" },
            { id: 8, name: "View Reports" },
            { id: 9, name: "Settings Access" },
            { id: 10, name: "API Access" }
        ]
    },
    {
        id: 2,
        name: "Admin Officer",
        permissions: [
            { id: 1, name: "Read User" },
            { id: 2, name: "Write User" },
            { id: 5, name: "Update User" },
            { id: 8, name: "View Reports" }
        ]
    },
    {
        id: 3,
        name: "ICT Officer",
        permissions: [
            { id: 1, name: "Read User" },
            { id: 8, name: "View Reports" }
        ]
    },
    {
        id: 4,
        name: "Finance Officer",
        permissions: [
            { id: 1, name: "Read User" },
            { id: 2, name: "Write User" },
            { id: 4, name: "Delete User" },
            { id: 6, name: "Create User" },
            { id: 7, name: "Manage Users" }
        ]
    },
    {
        id: 5,
        name: "Officer",
        permissions: [
            { id: 1, name: "Read User" },
            { id: 10, name: "API Access" }
        ]
    },
    {
        id: 6,
        name: "Supervisor",
        permissions: [
            { id: 1, name: "Read User" },
            { id: 10, name: "API Access" },
            { id: 4, name: "Delete User" },
            { id: 6, name: "Create User" },
        ]
    }
];