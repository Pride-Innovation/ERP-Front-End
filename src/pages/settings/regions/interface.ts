import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";

export interface IRegion {
    id: string | number;
    name: string;
}


export interface IRegionResponse extends IFetchDataRequest {
    content: Array<IRegion>
}

export interface IRegionsAxiosResponse extends IAxiosResponse {
    data: IRegionResponse
}

export interface IRegionAxiosResponse extends IAxiosResponse {
    data: IRegion
}