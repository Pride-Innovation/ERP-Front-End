export interface IUser {
    id: number | string;
    staffNumber: string;
    firstName: string;
    lastName: string;
    otherName: string;
    email: string;
    reportsTo: string;
    title: string;
    department: string;
    unit: string;
    gender: string;
    availability: boolean;
}