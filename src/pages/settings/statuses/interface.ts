export interface IStatus {
    id?: string | number;
    name: string;
    desc?: string | null;
    status?: string | null;
    image?: any | null;
    user_id?: number | null;
}

export interface IStatusDetails {
    status: IStatus;
    deleteStatus: (role: IStatus) => void;
    updateStatus: (role: IStatus) => void;
}