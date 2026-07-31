/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction } from "react";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { ICommodity } from "../settings/commodity/interface";
import { IBranch } from "../settings/branch/interface";
import { ISupplier } from "../settings/suppliers/interface";
import { IStatus } from "../settings/statuses/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { IUser } from "../users/interface";


export interface IStockCommodities {
    orderedQuantity: number;
    deliveredQuantity: number;
    costPrice: number;
    purchasePrice: number;
    // reorderLevel: string;
    commodity: ICommodity
}

/** One line of a physical delivery. */
export interface IStockReceiptLine {
    commodityId: number;
    commodityName: string;
    /** What arrived in this batch. */
    quantityReceived: number;
    orderedQuantity: number;
    /** Running total delivered against the line after this batch. */
    cumulativeDelivered: number;
    costPrice?: number | null;
    purchasePrice?: number | null;
}

/**
 * One physical delivery against an order, and the GRN it produced. An order delivered in three
 * batches has three of these — each with its own date, delivery note and receiving officer.
 */
export interface IStockReceipt {
    id: number;
    receiptDate?: string | null;
    deliveryNoteNumber?: string | null;
    invoiceNumber?: string | null;
    notes?: string | null;
    storeName?: string | null;
    grnNumber?: string | null;
    grnReportId?: number | null;
    receivedBy?: number | null;
    receivedByName?: string | null;
    totalQuantityReceived: number;
    lines: Array<IStockReceiptLine>;
}

/** One order line in the reconciliation report, with the records that should agree about it. */
export interface IStockReconciliationRow {
    stockId: number;
    lpoNumber?: string | null;
    stockName?: string | null;
    branchName?: string | null;
    statusName?: string | null;
    commodityId: number;
    commodityName: string;
    assetTypeName?: string | null;
    tracksAssets: boolean;
    orderedQuantity: number;
    deliveredQuantity: number;
    grnCoveredQuantity: number;
    registeredNumber: number;
    assetsOnRegister: number;
    quantityMissingFromGrn: number;
    assetsMissing: number;
    discrepant: boolean;
}

export interface IStockReconciliationReport {
    linesExamined: number;
    linesWithDiscrepancies: number;
    totalQuantityMissingFromGrn: number;
    totalAssetsMissing: number;
    rows: Array<IStockReconciliationRow>;
}

interface IInventory {
    id?: string | number;
    name: string;
    commodities?: Array<IStockCommodities> | null
    referenceNumber?: string | null;
    lpoNumber: string;
    poNumber?: string | null;
    // Real business dates for the purchase (ISO strings). deliveryDate is the basis
    // for asset depreciation/age.
    orderDate?: string | null;
    deliveryDate?: string | null;
    invoiceDate?: string | null;
    closeShortReason?: string | null;
    totalCost?: number | null;
    balanceCost?: number | null;
    branch?: IBranch | null;
    status?: IStatus | null;
    deliveryNote?: any | null;
    supplier?: ISupplier | null;
    createDate?: string | null;
    lastModified?: string | null;
    createdBy?: IUser | null;
    lastModifiedBy?: IUser | null;
    grnNumber?: string | null;
    grnReports
    ?: Array<{
        id: string | number;
        name: string;
        documentPath: string;
    }> | null;
}

interface IInventoryTableData {
    // name: string
    totalItemsOrdered: number;
    totalItemsDelivered: number;
    branch: string;
    status: string;
    supplier: string;
    date: string;
    "LPO Number": string;
    "Supply": string;
}

interface IDeleteInventory {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
}

interface IInventoryForm {
    formState: FormState<IInventory> & {
        errors: {
            name?: FieldError;
            referenceNumber?: FieldError;
            LPONumber?: FieldError;
        };
    };
    control: Control<IInventory>;
    register: UseFormRegister<IInventory>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
    /** Wizard mode: render only one part of the form. Omit to render the whole form (Update page). */
    section?: 'details' | 'items';
    /** Hide the internal Cancel/Submit bar (the wizard supplies its own navigation). */
    hideSubmitBar?: boolean;
    /**
     * Make the Delivered column read-only (the Update/correction page). Deliveries are recorded
     * against the order as receipts so the store, the asset register and the GRN move with them;
     * typing a new figure into a correction form cannot do any of that.
     */
    lockDeliveredQuantity?: boolean;
}


interface IInventoryResponse extends IFetchDataRequest {
    content: Array<IInventory>
}

interface IInventoriesAxiosResponse extends IAxiosResponse {
    data: IInventoryResponse
}

interface IInventoryAxiosResponse extends IAxiosResponse {
    data: IInventory
}


interface IGRNCommodity {
    id?: string | number;
    grnReport?: IGRNReport | null;
    commodity?: ICommodity | null;
    /** Units received on THIS delivery. */
    deliveredQuantity: number;
    orderedQuantity?: number;
    costPrice?: number | null;
    purchasePrice?: number | null;
    /** Cumulative position for the commodity after this delivery (snapshot at GRN time). */
    totalDeliveredQuantity?: number;
    totalOrderedQuantity?: number;
}

interface IGRNCommodityResponse extends IFetchDataRequest {
    content: Array<IGRNCommodity>
}

interface IGRNCommoditiesAxiosResponse extends IAxiosResponse {
    data: IGRNCommodityResponse
}

interface IDeleteInventoryResponse extends IAxiosResponse {
    data: {
        message: string;
        success: boolean;
    }
}

interface IGRNReport {
    id: string | number;
    name: string;
    documentPath: string;
    createDate: string | null;
    lastModified: string | null;
    createdBy: IUser | null;
    lastModifiedBy: IUser | null;
    grnDownloaded: boolean;
}

interface IGRNUploadResponse extends IAxiosResponse {
    data: IGRNReport
}


interface IInventoryDetailsTableData {
    id: string | number,
    name: string
    orderedQuantity: number;
    deliveredQuantity: number;
    costPrice: number;
    purchasePrice: number;
}

interface IGRNReportTableData {
    grnNumber: string;
    createDate: string;
    lastModified: string;
    grnUploaded?: string;
}


export type {
    IInventory,
    IInventoryForm,
    IDeleteInventory,
    IInventoryTableData,
    IInventoriesAxiosResponse,
    IInventoryAxiosResponse,
    IInventoryDetailsTableData,
    IGRNUploadResponse,
    IGRNReport,
    IGRNReportTableData,
    IGRNCommoditiesAxiosResponse,
    IGRNCommodity,
    IDeleteInventoryResponse
}