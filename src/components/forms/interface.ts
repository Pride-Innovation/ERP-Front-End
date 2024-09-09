import { FieldError, FieldValues } from 'react-hook-form';

export interface IButton {
    sendingRequest: boolean;
    buttonText: string;
    type?: "button" | "submit" | "reset";
}

export interface IInputForm {
    field: FieldValues;
    error: FieldError | undefined;
    label: string;
    type?: string;
    id: string;
    adornment?: boolean;
    handleClick?: () => void;
    handleMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export interface IInputPropAdornment {
    handleClick?: () => void;
    handleMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void
    optional?: boolean;
    position?: 'start' | 'end';
}