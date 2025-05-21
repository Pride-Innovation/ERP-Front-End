/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IUser } from "../../pages/users/interface";
import { branchesMock } from "../branch";
import { titlesMock } from "../title";

export const usersMock: IUser[] = [
    {
        id: 1,
        staffNumber: 'SN001',
        firstName: 'John',
        lastName: 'Doe',
        otherName: 'Michael',
        email: 'john.doe@example.com',
        title: titlesMock[0],
        department: null,
        gender: 'Male',
        profileImage: "",
        availability: "present",
        branch: branchesMock[0],
        enabled: false,
        accountNonLocked: false
    }
];
