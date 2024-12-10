import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

export interface IFleet {
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
    netValueB: string;
    registrationNumber?: string | null;
    desc?: string | null;
    image?: string | null;
    assetStatus?: string | null;
}

export interface IExtraFleetFields {
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


export interface IFleetForm {
    formState: FormState<IFleet> & {
        errors: {
            name?: FieldError;
            assetName?: FieldError;
            hostname?: FieldError;
            detailNetBookValue?: FieldError;
            engravedNumber?: FieldError;
            dateReceipt?: FieldError;
            make?: FieldError;
            assetCategory_id?: FieldError;
            supplier?: FieldError;
            unitOfMeasure?: FieldError;
            purchaseCost?: FieldError;
            costOfTheAsset?: FieldError;
            netValueB?: FieldError;
            registrationNumber?: FieldError;
            desc?: FieldError;
            image?: FieldError;
            assetStatus?: FieldError;
        };
    };
    control: Control<IFleet>;
    register: UseFormRegister<IFleet>;
    buttonText: string;
    sendingRequest: boolean;
}