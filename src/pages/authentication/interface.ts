import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

export interface IAuthentication {
    email: string;
    password: string;
}

export interface IAuthenticationForm {
    formState: FormState<IAuthentication> & {
        errors: {
            email?: FieldError;
            password?: FieldError;
        };
    };
    control: Control<IAuthentication>;
    register: UseFormRegister<IAuthentication>;
    buttonText: string;
    showPassword: boolean;
    loggingIn: boolean;
    handleMouseDownPassword: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleClickShowPassword: () => void;
    linkText?: string
    linkPath: string
    password?: boolean
}