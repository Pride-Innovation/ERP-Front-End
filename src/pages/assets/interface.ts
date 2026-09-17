/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FormState, Path, UseFormRegister, UseFormTrigger } from "react-hook-form";
import { ReactNode } from "react";
import { SelectChangeEvent } from "@mui/material";
import { IOptions } from "../../components/tables/interface";
import { IPermission } from "../settings/interface";
import { ISupplier } from "../settings/suppliers/interface";
import { IUser } from "../users/interface";
import { IBranch } from "../settings/branch/interface";
import { IStatus } from "../settings/statuses/interface";
import { IAssetType } from "../settings/assetTypes/interface";
import { ICommodity } from "../settings/commodity/interface";
import { IInventory } from "../inventory/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";

// ─────────────────────────────────────────────────────────────────────────
// Canonical Asset entity
// ─────────────────────────────────────────────────────────────────────────

/**
 * The single canonical asset shape. Every asset category (formerly IT
 * Equipment / Office Equipment / Fleet) uses this type — the previously-
 * separate `IITEquipment`, `IOfficeEquipment`, `IFleet` interfaces are now
 * just aliases of this one. Optional fields below are populated only when
 * the underlying category needs them (e.g. RAM / CPU on a laptop, but not
 * on a desk).
 */
export interface IAsset {
    id?: string | number;
    assetName: string;
    hostname?: string | null;
    detailNetBookValue?: string | null;
    engravedNumber: string;
    dateReceipt: string;
    make?: string | null;
    supplier?: ISupplier | null;
    unitOfMeasure: string;
    purchaseCost: string;
    costOfTheAsset: string;
    netValueB?: string | null;
    assignedTo?: IUser | null;
    branch?: IBranch | null;
    assetDepreciationRate?: string | null;
    /** Derived: total depreciation to date (gross cost − current net book value). Read-only. */
    accumulatedDepreciation?: string | null;
    /** Derived: current year's depreciation charge. Read-only. */
    annualDepreciation?: string | null;
    /** Derived: monthly depreciation charge (year's charge ÷ 12). Read-only. */
    monthlyDepreciation?: string | null;
    /** Derived: "In service" / "Ready for disposal". Read-only. */
    disposalStatus?: string | null;
    description?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    image?: string | null;
    assetStatus?: IStatus | null;
    assetType?: IAssetType | null;
    category?: string | null;
    lpoNumber: string;
    commodity?: ICommodity | null;
    stock?: IInventory | null;
    lastRepairedBy?: string | null;
    /** Pool stock for temporary replacement loans while another asset of the same category is under repair. */
    temporaryPool?: boolean | null;

    // IT-Equipment-shaped optional fields — kept on the canonical IAsset
    // (vs a separate IITEquipment) because the backend Asset entity has all
    // of them and any category may legitimately carry them.
    ram?: string | null;
    cpuSpeed?: string | null;
    hardDiskSize?: string | null;
    macAddress?: string | null;
    ipAddress?: string | null;
    interfaceType?: string | null;
}

// Legacy per-category aliases — kept as type aliases so existing call-sites
// keep compiling. Prefer `IAsset` for new code.
export type IITEquipment = IAsset;
export type IOfficeEquipment = IAsset;
export type IFleet = IAsset;

export interface IAssetResponse extends IFetchDataRequest {
    content: Array<IAsset>;
}

export interface IAssetsAxiosResponse extends IAxiosResponse {
    data: IAssetResponse;
}

export interface IAssetAxiosResponse extends IAxiosResponse {
    data: IAsset;
}

// Legacy response-type aliases.
export type IITEquipmentResponse = IAssetResponse;
export type IOfficeEquipmentResponse = IAssetResponse;
export type IFleetResponse = IAssetResponse;
export type IITEquipmentsAxiosResponse = IAssetsAxiosResponse;
export type IOfficeEquipmentsAxiosResponse = IAssetsAxiosResponse;
export type IFleetsAxiosResponse = IAssetsAxiosResponse;
export type IITEquipmentAxiosResponse = IAssetAxiosResponse;
export type IOfficeEquipmentAxiosResponse = IAssetAxiosResponse;
export type IFleetAxiosResponse = IAssetAxiosResponse;

// ─────────────────────────────────────────────────────────────────────────
// Form data
// ─────────────────────────────────────────────────────────────────────────

export interface IFormData<T> {
    value: Path<T>;
    label: string;
    type: "input" | "select" | "date" | "autocomplete" | "textarea" | "time" | "number";
    options?: Array<IOptions>;
    required?: boolean;
    disabled?: boolean;
    /** Disable this field only on the update form (e.g. cost fields are set at stocking and locked thereafter). */
    disabledOnUpdate?: boolean;
    multiple?: boolean;
}

/**
 * Common props consumed by the unified `AssetForm` and `SteppedAssetForm`.
 * Every per-category form type below is a type alias of this — the union of
 * error fields is broad enough to cover all categories.
 */
export interface IAssetForm {
    formState: FormState<IAsset> & {
        errors: {
            assetName?: FieldError;
            hostname?: FieldError;
            detailNetBookValue?: FieldError;
            engravedNumber?: FieldError;
            dateReceipt?: FieldError;
            make?: FieldError;
            unitOfMeasure?: FieldError;
            purchaseCost?: FieldError;
            costOfTheAsset?: FieldError;
            netValueB?: FieldError;
            model?: FieldError;
            serialNumber?: FieldError;
            ram?: FieldError;
            cpuSpeed?: FieldError;
            hardDiskSize?: FieldError;
            macAddress?: FieldError;
            ipAddress?: FieldError;
            interfaceType?: FieldError;
            assetDepreciationRate?: FieldError;
            description?: FieldError;
            image?: FieldError;
            category?: FieldError;
            desc?: FieldError;
            name?: FieldError;
        };
    };
    control: Control<IAsset>;
    register: UseFormRegister<IAsset>;
    buttonText: string;
    /**
     * Optional second action on the wizard's last step, e.g. "Save and add another".
     *
     * <p>Only the create page supplies these. `onSecondaryIntent` is called immediately before the
     * form submits, so the page can record which button was pressed and decide afterwards whether to
     * navigate away or clear the form for the next entry.
     */
    secondaryButtonText?: string;
    onSecondaryIntent?: () => void;
    sendingRequest: boolean;
    option?: string | undefined;
    handleChange?: (event: SelectChangeEvent) => void;
    lpoParams?: Record<string, any>;
    userParams?: Record<string, any>;
    supplierParams?: Record<string, any>;
    branchParams?: Record<string, any>;

    // Stepped-form extras.
    formFields?: any;
    computerFields?: any;
    categories?: Record<string, string>;
    selectedCategory?: string;
    stateFormFields?: any;
    isUpdate?: boolean;
    loading?: boolean;
    trigger?: UseFormTrigger<IAsset>;
    /** Override the asset type ID used for commodity filtering. */
    overrideAssetTypeId?: number;
}

// Legacy per-category form-prop aliases.
export type IITEquipmentForm = IAssetForm;
export type IOfficeEquipmentForm = IAssetForm;
export type IFleetForm = IAssetForm;

// ─────────────────────────────────────────────────────────────────────────
// Table-row data shapes (what the asset list table renders per row)
// ─────────────────────────────────────────────────────────────────────────

export interface IAssetTableData {
    assetName: string;
    engravedNumber?: string | null;
    dateReceived: string;
    make?: string | null;
    purchaseCost?: string | null;
    costOfAsset?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    status: string;
    assignedTo: string;
    location: string;
    manufacturer?: string | null;
    [key: string]: any;
}

// Legacy aliases.
export type IITEquipmentTableData = IAssetTableData;
export type IOfficeEquipmentTableData = IAssetTableData;
export type IFleetTableData = IAssetTableData;

// ─────────────────────────────────────────────────────────────────────────
// Bulk import row shape
// ─────────────────────────────────────────────────────────────────────────

export interface IBulkAssetData {
    "No.": number;
    "Product Name": string;
    "Asset Tag": string;
    "Asset Serial No.": string;
    "Model": string;
    "USER": string;
    "LOCATION": string;
    "DATE OF PM/Verification": number;
}

// ─────────────────────────────────────────────────────────────────────────
// Modal action props (used by Dispose/Repair/Reassign/ToStore)
// ─────────────────────────────────────────────────────────────────────────

export interface IAssetAction {
    handleClose: () => void;
    handleClickAction?: (option: string | number, moduleID: string | number) => void;
    sendingRequest: boolean;
    buttonText: string;
    asset: IAsset;
    module?: string;
}

export type IDispose = IAssetAction;
export type IRepair = IAssetAction;
export type IReassign = IAssetAction;
export type IToStore = IAssetAction;

// ─────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────

export interface INavigation {
    id: number;
    text: string;
    path: string;
    icon: JSX.Element;
    otherRoutes: Array<string>;
    permission?: IPermission;
}

export interface IAssignmentHistory {
    id?: string | number;
    startDate: string;
    endDate: string;
    statusBefore: string;
    statusAfter: string;
    user: string;
    serialNumber: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Misc bits referenced by the (now-consolidated) per-category code
// ─────────────────────────────────────────────────────────────────────────

export interface IAsssetCategory {
    id: number;
    name: string;
    status: string;
    desc: string;
    image: any;
    user_id: number;
}

export interface IFormSection {
    title: string;
    icon: ReactNode;
    fields: Array<IFormData<IAsset>>;
}

// ─────────────────────────────────────────────────────────────────────────
// Repair tracking
// ─────────────────────────────────────────────────────────────────────────

export interface IRepairDetails {
    id: number | string;
    repairStartDate: string;
    repairEndDate: string;
    technician: string;
    repairReason: string;
    documents: string[];
    asset: IAsset;
    status: string;
    completionNotes: string;
    completionDocuments: string[];
}

export interface IRepairDetailsResponse extends IFetchDataRequest {
    content: Array<IRepairDetails>;
}

export interface IRepairDetailsAxiosResponse extends IAxiosResponse {
    data: IRepairDetailsResponse;
}

export interface IRepairDetailAxiosResponse extends IAxiosResponse {
    data: IRepairDetails;
}

export interface IRepairsTableData {
    id: number | string;
    repairStartDate: string;
    repairEndDate: string;
    technician: string;
    repairReason: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Bulk import
// ─────────────────────────────────────────────────────────────────────────

/**
 * Dropdown sources, field configuration and row limits for an import template.
 *
 * Assembled server-side so the template's dropdowns and the importer's validation are the same sets,
 * and so the limits track the server's own configuration rather than being duplicated here.
 */
export interface IAssetImportTemplate {
    assetTypeId: number;
    assetTypeName: string;
    /** Field name → 'required' | 'optional' | 'hidden'. The same map that drives the create form. */
    fieldConfig: Record<string, string> | null;
    branches: string[];
    suppliers: string[];
    commodities: string[];
    statuses: string[];
    /** "PBL0001 — Jane Doe". */
    staff: string[];
    /** Rows per request; a file is chunked into batches of this size. */
    batchSize: number;
    /** Rows per file, checked before anything is uploaded. */
    maxRows: number;
}

/** One row the importer refused, with the reason. */
export interface IAssetImportRowError {
    row: number;
    assetName?: string | null;
    engravedNumber?: string | null;
    serialNumber?: string | null;
    error: string;
}

/** The outcome of a whole file, accumulated across its batches. */
export interface IAssetImportResult {
    success: boolean;
    total: number;
    inserted: number;
    failed: number;
    errors: IAssetImportRowError[];
}
