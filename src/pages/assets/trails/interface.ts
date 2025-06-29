import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { IStatus } from "../../settings/statuses/interface";
import { IUser } from "../../users/interface";
import { IAsset } from "../interface";

export interface IAssetAssignmentHistory {
    id?: string | number;
    startDate: string;
    endDate?: string;
    user?: IUser | null;
    asset?: IAsset | null;
    statusBefore?: IStatus | null;
    statusAfter?: IStatus | null
}



export interface IAssetAssignmentHistoryResponse extends IFetchDataRequest {
    content: Array<IAssetAssignmentHistory>
}

export interface IAssetAssignmentHistorysAxiosResponse extends IAxiosResponse {
    data: IAssetAssignmentHistoryResponse
}

export interface IAssetAssignmentHistoryAxiosResponse extends IAxiosResponse {
    data: IAssetAssignmentHistory
}

export interface IAssetAssignmentHistoryTableData {
    user: string;
    engravedNumber: string;
    statusBefore: string;
    statusAfter: string;
    startDate: string;
    endDate: string;
}