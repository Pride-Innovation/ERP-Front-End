export interface IUsersExcludedTableData {
    id?: string | number;
    reportsTo: string;
    firstName: string;
    lastName: string;
    otherName?: string | null;
    image?: string
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

export interface IUser extends IUsersExcludedTableData, IUsersTableData { }


export interface ICreateUser {
    handleClose: () => void;
}

export interface IUpdateUser {
    handleClose: () => void;
}

export interface IDeactivate {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    user: IUser
}