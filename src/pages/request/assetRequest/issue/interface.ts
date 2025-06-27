import { IAxiosResponse, IFetchDataRequest } from "../../../../core/apis/interface";
import { IUser } from "../../../users/interface";

export interface IIssue {
    id?: string | number;
    comment: string;
    createDate: string;
    lastModified: string;
    createdBy: IUser;
    lastModifiedBy: IUser;
}

export interface IIssueResponse extends IFetchDataRequest {
    content: Array<IIssue>
}

export interface IIssuesAxiosResponse extends IAxiosResponse {
    data: IIssueResponse
}

export interface IIssueAxiosResponse extends IAxiosResponse {
    data: IIssue
}