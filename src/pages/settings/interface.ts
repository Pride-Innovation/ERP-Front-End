export interface IPermission {
    id: number | string;
    name: string;
}


export interface IRole {
    id: string | number;
    name: string;
    permissions: Array<IPermission>;
}


export interface IModule {
    id: number | string;
    icon: JSX.Element;
    name: string;
}