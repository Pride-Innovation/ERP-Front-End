interface IUsersExcludedTableData {
    id: string | number
    reportsTo: string
    firstName: string
    lastName: string
    otherName: string
}

export interface IUsersTableData {
    email: string;
    title: string;
    department: string;
    unit: string;
    gender: string;
    staffNumber: string;
    availability: boolean;
}

export interface IUser extends IUsersExcludedTableData, IUsersTableData {}