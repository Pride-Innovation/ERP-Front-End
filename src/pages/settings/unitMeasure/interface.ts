import { IUnitOfMeasure } from "../../assets/ITEquipment/interface";

export interface IUpdateUnitOfMeasure {
    handleClose: () => void;
    sendingRequest: boolean;
    unitOfMeasure: IUnitOfMeasure
}

export interface IUnitOfMeasureDetails {
    unitOfMeasure: IUnitOfMeasure;
    deleteUnitOfMeasure: (role: IUnitOfMeasure) => void;
    updateUnitOfMeasure: (role: IUnitOfMeasure) => void;
}

export interface IDeleteUnitOfMeasure {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    unitOfMeasure: IUnitOfMeasure
}