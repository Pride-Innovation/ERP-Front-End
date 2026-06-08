/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';
import { IStatus } from '../../settings/statuses/interface';
import { IAssetType, IAssetFieldConfig, FieldConfigState } from '../../settings/assetTypes/interface';

/**
 * Resolves the effective validation state for a string field.
 * - If fieldConfig is provided and has an entry for this key, use it.
 * - Otherwise fall back to the hard-coded default.
 */
const resolveState = (
    fieldConfig: IAssetFieldConfig | null | undefined,
    key: keyof IAssetFieldConfig,
    defaultRequired: boolean
): FieldConfigState => {
    if (fieldConfig && fieldConfig[key] !== undefined) {
        return fieldConfig[key] as FieldConfigState;
    }
    return defaultRequired ? 'required' : 'optional';
};

const strField = (
    fieldConfig: IAssetFieldConfig | null | undefined,
    key: keyof IAssetFieldConfig,
    requiredMsg: string,
    defaultRequired: boolean
) => {
    const state = resolveState(fieldConfig, key, defaultRequired);
    return state === 'required'
        ? yup.string().required(requiredMsg)
        : yup.string().nullable().optional();
};

const mixedField = (
    fieldConfig: IAssetFieldConfig | null | undefined,
    key: keyof IAssetFieldConfig,
    requiredMsg: string,
    defaultRequired: boolean
) => {
    const state = resolveState(fieldConfig, key, defaultRequired);
    return state === 'required'
        ? yup.mixed<any>().required(requiredMsg)
        : yup.mixed<any>().nullable().optional();
};

/**
 * Builds a Yup validation schema driven by the asset type's fieldConfig.
 * Pass `null` or `undefined` to get the original static schema behaviour.
 */
export const buildOfficeEquipmentSchema = (fieldConfig?: IAssetFieldConfig | null) =>
    yup.object().shape({
        // ── Identification (hard-coded defaults: required) ──────────────────
        assetName:          strField(fieldConfig, 'assetName',          'Asset name is required',        true),
        engravedNumber:     strField(fieldConfig, 'engravedNumber',     'Engraved number is required',   true),
        hostname:           strField(fieldConfig, 'hostname',           'Host name is required',         true),
        make:               strField(fieldConfig, 'make',               'Make is required',              true),
        // ── Financial ────────────────────────────────────────────────────────
        detailNetBookValue: strField(fieldConfig, 'detailNetBookValue', 'NetBook value is required',     true),
        netValueB:          strField(fieldConfig, 'netValueB',          'Net value is required',         true),
        purchaseCost:       strField(fieldConfig, 'purchaseCost',       'Purchase cost is required',     true),
        costOfTheAsset:     strField(fieldConfig, 'costOfTheAsset',     'Cost of asset is required',     true),
        assetDepreciationRate: strField(fieldConfig, 'assetDepreciationRate', 'Depreciation rate is required', false),
        // ── Dates & References ───────────────────────────────────────────────
        dateReceipt:        strField(fieldConfig, 'dateReceipt',        'Receipt date is required',      true),
        lpoNumber:          strField(fieldConfig, 'lpoNumber',          'LPO Number is required',        true),
        // ── Classification ───────────────────────────────────────────────────
        unitOfMeasure:      strField(fieldConfig, 'unitOfMeasure',      'Unit of measure is required',   true),
        category:           strField(fieldConfig, 'category',           'Category is required',          false),
        // ── Identification (extended) ────────────────────────────────────────
        model:              strField(fieldConfig, 'model',              'Model is required',             false),
        serialNumber:       strField(fieldConfig, 'serialNumber',       'Serial number is required',     false),
        // ── Technical (IT / network) ─────────────────────────────────────────
        ram:                strField(fieldConfig, 'ram',                'RAM is required',               false),
        cpuSpeed:           strField(fieldConfig, 'cpuSpeed',           'CPU speed is required',         false),
        hardDiskSize:       strField(fieldConfig, 'hardDiskSize',       'Hard disk size is required',    false),
        macAddress:         strField(fieldConfig, 'macAddress',         'MAC address is required',       false),
        ipAddress:          strField(fieldConfig, 'ipAddress',          'IP address is required',        false),
        interfaceType:      strField(fieldConfig, 'interfaceType',      'Interface type is required',    false),
        // ── Other string fields (optional by default) ────────────────────────
        description:        strField(fieldConfig, 'description',        'Description is required',       false),
        image:              strField(fieldConfig, 'image',              'Image is required',             false),
        // ── Object / mixed fields ────────────────────────────────────────────
        supplier:           mixedField(fieldConfig, 'supplier',         'Supplier is required',          false),
        assignedTo:         mixedField(fieldConfig, 'assignedTo',       'Assigned to is required',       false),
        assetStatus:        yup.mixed<IStatus>().nullable().optional(),
        assetType:          yup.mixed<IAssetType>().nullable().optional(),
        branch:             mixedField(fieldConfig, 'branch',           'Branch is required',            false),
    });

/** Static schema kept for backward-compat usage in non-general asset forms. */
export const officeEquipmentSchema = buildOfficeEquipmentSchema(null);
