import { IAxiosResponse, IFetchDataRequest } from "../../../../core/apis/interface";
import { IUser } from "../../../users/interface";
import { IRequest } from "../../interface";

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

export interface IAcknowledgeIssuanceReceipt {
    requestId: string | number;
    comment: string;
    user?: IUser | null;
    request?: IRequest | null;
    createDate?: string | null;
    lastModified?: string | null;
    createdBy?: IUser | null;
    lastModifiedBy?: IUser | null;
}

export interface IAcknowledgeIssuanceReceiptAxiosResponse extends IAxiosResponse {
    data: IAcknowledgeIssuanceReceipt
}