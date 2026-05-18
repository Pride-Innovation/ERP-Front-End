/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";
import { IAssetFieldConfig } from "../interface";

const createAssetTypeService = async (body: Object) => {
    const response = await axiosInstance.post('asset-types', body);
    return response;
};

const updateAssetTypeService = async (body: Object, id: string | number) => {
    const response = await axiosInstance.put(`asset-types/${id}`, body);
    return response;
};

const deleteAssetTypeService = async (id: string | number) => {
    const response = await axiosInstance.delete(`asset-types/${id}`);
    return response;
};

/**
 * Persists the field configuration for an asset type.
 * Backend endpoint: PUT /api/v1/asset-types/{id}/field-config
 * Body: IAssetFieldConfig (flat — each field key maps directly to its state string)
 */
const updateAssetTypeFieldConfigService = async (id: string | number, fieldConfig: IAssetFieldConfig) => {
    const response = await axiosInstance.put(`asset-types/${id}/field-config`, fieldConfig);
    return response;
};

export {
    createAssetTypeService,
    updateAssetTypeService,
    deleteAssetTypeService,
    updateAssetTypeFieldConfigService,
};
