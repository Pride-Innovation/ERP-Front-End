import { Path } from "react-hook-form";
import { IOptions } from "../../components/tables/interface";

export interface IFormData<T> {
    value: Path<T>;
    label: string;
    type: "input" | "select" | "date" | "autocomplete";
    options?: Array<IOptions>
}

export interface IDispose {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string
}

export interface INavigation {
    id: number, text: string, path: string, icon: JSX.Element, otherRoutes: Array<string>
}