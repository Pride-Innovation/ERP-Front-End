import { IRole } from "../settings/interface";

export interface IUsersExcludedTableData {
    id?: string | number;
    name?: string;
    reportsTo?: string;
    firstName: string;
    lastName: string;
    otherName?: string | null;
    image?: string;
    role?: IRole
}

export interface IUsersTableData {
    email: string;
    title: string;
    department: string;
    unit: string;
    gender: string;
    staffNumber: string;
    availability?: string;
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
    user: IUser;
    handleDeactivate?: (id: string | number) => void
}

export interface IResponseData {

    status: "success" | "failed",
    data: {
        message: string;
    }
}