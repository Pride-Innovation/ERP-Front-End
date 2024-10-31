import { Control, FieldError, FieldValues, FormState, Path, UseFormRegister } from 'react-hook-form';
import { IOptions } from '../tables/interface';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

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
    row?: number
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
    color: "primary" | "secondary" | "error" | "info" | "success" | "warning"
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
}

export interface IDatePickerComponent {
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
}

export interface IFileUploadButton {
    title: string;
    module: string;
}

export interface ICheckboxComponent {
    checked: boolean;
    name?: string ;
    handleChangeEvent: (event: ChangeEvent<HTMLInputElement>) => void
}