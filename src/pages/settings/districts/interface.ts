import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";

export interface IDistrict {
    id: string | number;
    name: string;
}


export interface IDistrictResponse extends IFetchDataRequest {
    content: Array<IDistrict>
}

export interface IDistrictsAxiosResponse extends IAxiosResponse {
    data: IDistrictResponse
}

export interface IDistrictAxiosResponse extends IAxiosResponse {
    data: IDistrict
}