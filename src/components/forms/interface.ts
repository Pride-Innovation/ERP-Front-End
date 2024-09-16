import { FieldError, FieldValues } from 'react-hook-form';
import { IOptions } from '../tables/interface';

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
    type?: string;
    id: string;
    adornment?: boolean;
    required?: boolean
    handleClick?: () => void;
    handleMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void
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
    buttonText: string;
    options: Array<IOptions>
    handleOptionClicked?: (option: number | string) => void;
}