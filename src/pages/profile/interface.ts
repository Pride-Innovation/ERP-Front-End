/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction } from "react";
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
    handleClose: () => void
}

export interface IChangePasswordComponent {
    handleClose: () => void;
}

export interface IUpdateProfileImage {
    setImage: Dispatch<SetStateAction<string>>
    userImage: string;
}