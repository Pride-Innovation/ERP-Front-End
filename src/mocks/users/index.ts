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
