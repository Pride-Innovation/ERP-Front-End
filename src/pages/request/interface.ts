import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from "react-hook-form";

export interface IAssetParticulars {
    name: string;
    serialNumber: string;
    engravedNumber: string;
}

export interface IRequest {
    id?: string | number;
    officerName: string;
    title: string;
    department: string;
    reason: string;
    quantity: number;
    status?: string;
    destination: string;
    expectedReturnDate: string;
    particulars: Array<IAssetParticulars>;
}


export interface IRequestForm {
    formState: FormState<IRequest> & {
        errors: {
            officerName?: FieldError;
            title?: FieldError;
            department?: FieldError;
            reason?: FieldError;
            quantity?: FieldError;
            destination?: FieldError;
            expectedReturnDate?: FieldError;
        };
    };
    control: Control<IRequest>;
    register: UseFormRegister<IRequest>;
    buttonText: string;
    sendingRequest: boolean;
}