import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

export interface IChangePassword {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IIChangePasswordForm {
    formState: FormState<IChangePassword> & {
        errors: {
            email?: FieldError;
            newPassword?: FieldError;
            confirmPassword?: FieldError;
        };
    };
    control: Control<IChangePassword>;
    register: UseFormRegister<IChangePassword>;
    buttonText: string;
    showOldPassword: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    sendingRequest: boolean;
    handleMouseDownPassword: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleClickShowOldPassword: () => void;
    handleClickShowNewPassword: () => void;
    handleClickShowConfirmPassword: () => void;
}