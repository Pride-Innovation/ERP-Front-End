import { SelectChangeEvent } from "@mui/material";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

export interface IITEquipment {
    id?: string | number;
    assetName: string;
    name?: string;
    hostname: string;
    detailNetBookValue: string;
    engravedNumber: string;
    dateReceipt: string;
    make: string;
    assetCategory_id: string;
    supplier: string;
    unitOfMeasure: string;
    purchaseCost: string;
    costOfTheAsset: string;
    netValueB: string,
    model?: string | null;
    serialNumber?: string | null;
    user_id?: string | null;
    branch_id?: string | null;
    ram?: string | null;
    cpuSpeed?: string | null;
    hardDiskSize?: string | null;
    location?: string | null;
    macAddress?: string | null;
    ipAddress?: string | null;
    interfaceType?: string | null;
    assetDepreciationRate?: string | null;
    assetSubCategory_id?: string | null;
    desc?: string | null;
    image?: string | null;
    assetStatus?: string | null;
    category?: string | null
}


export interface IITEquipmentExtras {
    status1: string;
    status2: string;
    status3: string;
    status4: string;
    status5: string;
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    col5: string;
}

export interface IITEquipmentForm {
    formState: FormState<IITEquipment> & {
        errors: {
            assetName?: FieldError
            hostname?: FieldError
            detailNetBookValue?: FieldError
            engravedNumber?: FieldError
            dateReceipt?: FieldError
            make?: FieldError
            assetCategory_id?: FieldError
            supplier?: FieldError
            unitOfMeasure?: FieldError
            purchaseCost?: FieldError
            costOfTheAsset?: FieldError
            netValueB?: FieldError,
            model?: FieldError
            serialNumber?: FieldError
            user_id?: FieldError
            ram?: FieldError
            cpuSpeed?: FieldError
            hardDiskSize?: FieldError
            location?: FieldError
            macAddress?: FieldError
            ipAddress?: FieldError
            interfaceType?: FieldError
            assetDepreciationRate?: FieldError
            assetSubCategory_id?: FieldError
            desc?: FieldError
            image?: FieldError
            assetStatus?: FieldError
        };
    };
    control: Control<IITEquipment>;
    register: UseFormRegister<IITEquipment>;
    buttonText: string;
    sendingRequest: boolean;
    option?: string | undefined;
    handleChange?: (event: SelectChangeEvent) => void;
}

export interface IBranch {
    id: number
    name: string
    email: string
    tel: string | null
    desc: string | null
    status: string,
    user_id: number,
    image: any
}

export interface IAsssetStatus {
    id: number,
    name: string,
    status: string,
    desc: string,
    image: any,
    user_id: number
}

export interface IAsssetCategory {
    id: number,
    name: string,
    status: string,
    desc: string,
    image: any,
    user_id: number
}

export interface IUnitOfMeasure {
    id: number,
    name: string,
    status: string,
    desc: string,
    image: any,
    user_id: number
    symbol: string
}

export interface ISupplier {
    id: number,
    name: string,
    status: string,
    desc: string,
    image: any,
    user_id: number
    symbol: string
    tel: string,
    email: string,
    // Nice to have a supplier product type!!!
}