import { ISupplier } from "../../assets/ITEquipment/interface";

interface ISupplierDetails {
    supplier: ISupplier;
    deleteSupplier: (role: ISupplier) => void;
    updateSupplier: (role: ISupplier) => void;
}

export type {
    ISupplierDetails
}