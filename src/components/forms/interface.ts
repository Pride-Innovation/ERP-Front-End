/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FieldValues, FormState, Path, UseFormRegister } from 'react-hook-form';
import { IOptions } from '../tables/interface';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { IAsset } from '../../pages/assets/interface';
import { SxProps, Theme } from "@mui/material";

export interface IButton {
    sendingRequest: boolean;
    variant?: "contained" | "outlined"
    buttonText: string;
    buttonColor: "primary" | "inherit" | "secondary" | "success" | "error" | "info" | "warning";
    type?: "button" | "submit" | "reset";
    handleClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface IInputForm {
    field: FieldValues;
    error: FieldError | undefined;
    label: string;
    multiline?: boolean
    type?: string;
    id: string;
    adornment?: boolean;
    required?: boolean
    handleClick?: () => void;
    handleMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    row?: number;
    disabled?: boolean
    placeholder?: string;
    helperText?: string;
}

export interface IInputPropAdornment {
    handleClick?: () => void;
    handleMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void
    optional?: boolean;
    position?: 'start' | 'end';
}

export interface IChip {
    label: string;
    icon: JSX.Element;
    variant?: "filled" | "outlined";
    size: "small" | "medium"
    color: "primary" | "secondary" | "error" | "info" | "success" | "warning";
    sx?: SxProps<Theme>;
}

export interface IPopover {
    options: Array<IOptions>
    handleOptionClicked?: (option: number | string, moduleID?: string | number) => void;
    moduleID?: string | number;
    setAnchorEl: Dispatch<SetStateAction<HTMLButtonElement | null>>
    anchorEl: HTMLButtonElement | null
}

export interface ISelectComponent {
    label: string
    options: Array<IOptions>
    required: boolean;
    field: FieldValues;
    error: FieldError | undefined;
    id: string;
}

export interface IUseFormInput<T extends FieldValues> {
    register: UseFormRegister<any>;
    control: Control<any>;
    formState: FormState<T> & {
        errors: any;
    };
    value: Path<T>;
    label: string;
    type?: string;
    options?: IOptions[];
    row?: number;
    multiline?: boolean;
    multiple?: boolean;
    required?: boolean;
    fetchOptions?: (query: string) => Promise<void>;
    disabled?: boolean;
    onInputChange?: (event: any, value: string) => void;
    renderOption?: (props: any, option: any) => React.ReactNode;
    onChange?: (event: any, value: any) => void;
    placeholder?: string;
    helperText?: string;
}

export interface IDatePickerComponent {
    label: string
    field: FieldValues;
    error: FieldError | undefined;
    id?: string;
}

export interface ITimePickerComponent {
    label: string
    field: FieldValues;
    error: FieldError | undefined;
    id?: string;
}

export interface IAutocompleteComponent {
    label: string
    options: Array<IOptions>
    field: FieldValues;
    error: FieldError | undefined;
    multiple?: boolean;
    name?: string;
    disabled?: boolean
}

export interface IFileUploadButton {
    title: string;
    module: string;
}

export interface ICheckboxComponent {
    checked: boolean;
    name?: string;
    handleChangeEvent: (event: ChangeEvent<HTMLInputElement>) => void
}

export interface RowData {
    id: number;
    name: string | '';
    groupName: string;
    quantity: number;
    commodityId?: number;
    selectedOptions?: string[];
    assetTypeId?: string;
    selectedAssets?: IAsset[]
}

export interface StockRowData {
    id: number;
    name: string | '';
    groupName: string;
    orderedQuantity: number;
    deliveredQuantity: number;
    commodityId?: number;
    costPrice: number | '';
    purchasePrice: number | '';
    assetTypeId?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    validData?: RowData[];
}


export interface StockValidationResult {
    isValid: boolean;
    errors: string[];
    validData?: StockRowData[];
}