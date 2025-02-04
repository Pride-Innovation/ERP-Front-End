import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

interface IInventory {
    id?: string | number;
    name: string;
    quantityInStock: number;
    unitOfMeasure: string;
    location: string;
    category: string;
    reorderLevel: string;
    costPrice: string;
    purchasePrice: string
    supplier: string
    description: string
    expirationDate: string
}

interface ICreateInventory {
    handleClose: () => void;
}

interface IInventoryForm {
    formState: FormState<IInventory> & {
        errors: {
            name?: FieldError;
            quantityInStock?: FieldError;
            unitOfMeasure?: FieldError;
            location?: FieldError;
            category?: FieldError;
            reorderLevel?: FieldError;
            costPrice?: FieldError;
            purchasePrice?: FieldError
            supplier?: FieldError
            description?: FieldError
            expirationDate?: FieldError
        };
    };
    control: Control<IInventory>;
    register: UseFormRegister<IInventory>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export type {
    IInventory,
    ICreateInventory,
    IInventoryForm
}