import { IUser } from "../../users/interface";
import { IUnit } from "../unit/interface";

interface IDepartment {
    id: string | number;
    name: string;
    status: 1;
    desc: string;
    image: string;
    head: string | number | IUser |null ;
    created_at: string;
    updated_at: string;
    units?: Array<IUnit>
}

interface IDepartmentDetails {
    department: IDepartment;
    deleteDepartment: (role: IDepartment) => void;
    updateDepartment: (role: IDepartment) => void;
}

export type {
    IDepartment,
    IDepartmentDetails
}