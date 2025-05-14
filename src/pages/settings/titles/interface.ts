import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";

export interface ITitle {
    id?: string | number;
    name: string;
    reportsTo?: ITitle
}

export interface ITitleDetails {
    title: ITitle;
    deleteTitle: (role: ITitle) => void;
    updateTitle: (role: ITitle) => void;
}

export interface ITitleResponse extends IFetchDataRequest {
    content: Array<ITitle>
}

export interface ITitlesAxiosResponse extends IAxiosResponse {
    data: ITitleResponse
}

export interface ITitleAxiosResponse extends IAxiosResponse {
    data: ITitle
}