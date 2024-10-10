import {
    Control,
    FieldError,
    FormState,
    Path,
    UseFormRegister
} from "react-hook-form";
import { IOptions } from "../../components/tables/interface";
import { SelectChangeEvent } from "@mui/material";

export interface IAsset {
    id?: string | number;
    name: string;
    category: string;
    engravedNumber: string;
    model: string;
    serialNo: string;
    ram?: string | null;
    cpuSpeed?: string | null;
    hardDiskSize?: string | null;
    ipAddress?: string | null;
    macAddress?: string | null;
    interfaceType?: string | null;
    location?: string | null;
    status?: string | null;
    purchaseCost?: string | null;
    verificationDate?: string | null;
    deploymentDate?: string | null;
    costOfAsset?: number | null;
    netValue?: string | null;
    depreciationRate?: string | null;
    assignedTo?: string | null
}

export interface IAssetForm {
    formState: FormState<IAsset> & {
        errors: {
            name?: FieldError;
            category?: FieldError;
            engravedNumber?: FieldError;
            model?: FieldError;
            serialNo?: FieldError;
            ram?: FieldError;
            cpuSpeed?: FieldError;
            hardDiskSize?: FieldError;
            ipAddress?: FieldError;
            macAddress?: FieldError;
            interfaceType?: FieldError;
            location?: FieldError;
            status?: FieldError;
            purchaseCost?: FieldError;
            verificationDate?: FieldError;
            deploymentDate?: FieldError;
            costOfAsset?: FieldError;
            netValue?: FieldError;
            depreciationRate?: FieldError;
            assignedTo?: FieldError
        };
    };
    control: Control<IAsset>;
    register: UseFormRegister<IAsset>;
    buttonText: string;
    sendingRequest: boolean;
    option?: string | undefined;
    handleChange?: (event: SelectChangeEvent) => void;
}

export interface IFormData<T> {
    value: Path<T>;
    label: string;
    type: "input" | "select" | "date" | "autocomplete";
    options?: Array<IOptions>
}