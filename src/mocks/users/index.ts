/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IUser } from "../../pages/users/interface";
import { rolesMock } from "../settings";

export const usersMock: IUser[] = [
    {
        id: 1,
        staffNumber: 'SN001',
        firstName: 'John',
        lastName: 'Doe',
        otherName: 'Michael',
        name: "",
        email: 'john.doe@example.com',
        reportsTo: 'Jane Smith',
        title: 'Software Engineer',
        department: 'Engineering',
        unit: 'Backend',
        gender: 'Male',
        image: "image",
        availability: "present",
        role: rolesMock[0]
    }
];
