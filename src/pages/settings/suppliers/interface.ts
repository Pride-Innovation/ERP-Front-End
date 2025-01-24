import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from "react-hook-form";

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

interface ISupplierDetails {
    supplier: ISupplier;
    deleteSupplier: (role: ISupplier) => void;
    updateSupplier: (role: ISupplier) => void;
}

interface ICreateSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
}

interface IUpdateSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    supplier: ISupplier
}

interface IDeleteSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    supplier: ISupplier
}

interface ISupplierForm {
    formState: FormState<ISupplier> & {
        errors: {
            name?: FieldError;
            email?: FieldError;
            tel?: FieldError;
            desc?: FieldError;
            status?: FieldError;
        };
    };
    control: Control<ISupplier>;
    register: UseFormRegister<ISupplier>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export type {
    ISupplierDetails,
    ISupplierForm,
    ICreateSupplier,
    IUpdateSupplier,
    IDeleteSupplier
}