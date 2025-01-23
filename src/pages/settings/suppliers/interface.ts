import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from "react-hook-form";
import { ISupplier } from "../../assets/ITEquipment/interface";

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