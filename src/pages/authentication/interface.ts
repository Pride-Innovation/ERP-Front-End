import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IUser } from "../users/interface";
import { IPermission, IRole } from "../settings/interface";

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

export interface ILoginResponse {
    status: "success" | "failed",
    data: { access_token: string } | null,
    message?: string;
}

export interface IUserProfileResponse {
    status: "success" | "failed",
    data: {
        user: IUser;
        roles: Array<IRole>;
        permissions: Array<IPermission>
    } | null
}
