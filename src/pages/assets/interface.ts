import { Path } from "react-hook-form";
import { IOptions } from "../../components/tables/interface";
import { IITEquipment } from "./ITEquipment/interface";
import { IOfficeEquipment } from "./officeEquipment/interface";
import { IPermission } from "../settings/interface";

export interface IFormData<T> {
    value: Path<T>;
    label: string;
    type: "input" | "select" | "date" | "autocomplete" | "textarea" | "time" | "number";
    options?: Array<IOptions>;
    required?: boolean;
}

export interface IDispose {
    handleClose: () => void;
    handleClickAction?: (option: string | number, moduleID: string | number) => void;
    sendingRequest: boolean;
    buttonText: string;
    asset: IITEquipment | IOfficeEquipment;
}

export interface INavigation {
    id: number;
    text: string;
    path: string;
    icon: JSX.Element;
    otherRoutes: Array<string>;
    permission?: IPermission
}

export interface IAssignmentHistory {
    id?: string | number;
    startDate: string;
    endDate: string;
    statusBefore: string;
    statusAfter: string;
    user: string;
    serialNumber: string;
}

export interface IRepairHistory {
    id?: string | number;
    repairDate: string;
    repairedPart: string;
    technician: string;
    serialNumber: string;
}