/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Unified asset service — the previous per-category files
 * (`ITEquipment/service`, `officeEquipment/service`, `fleet/service`) were
 * pure copy-paste wrappers around these same endpoints. Everything that
 * touches an asset now goes through here, regardless of category.
 *
 * The functions are exported under category-neutral names *and* under the
 * legacy aliases so existing callers keep working until they migrate.
 */

import axiosInstance from "../../../../core/apis/axiosInstance";

const createAssetService = async (body: object) => {
    try {
        const response = await axiosInstance.post("assets", body);
        return response;
    } catch (error) {
        return error;
    }
};

const getAssetByIdService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assets/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

const updateAssetService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`assets/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
};

const disposeAssetService = async (id: string | number) => {
    try {
        const response = await axiosInstance.post(`assets/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

const reassignAssetService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.post(`assets/reassign/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
};

const repairAssetService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.post(`assets/repairs/${id}`, body, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (error) {
        return error;
    }
};

const completeRepairAssetService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.put(`assets/repairs/${id}`, body, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (error) {
        return error;
    }
};

const listRepairDetailService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assets/repairs/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

const updateAssetImageService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.put(`assets/image/${id}`, body, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (error) {
        return error;
    }
};

const removeAssetImageService = async (id: string | number) => {
    try {
        const response = await axiosInstance.put(`assets/remove/image/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

const sendAssetToStoreService = async (id: number) => {
    try {
        const response = await axiosInstance.put(`assets/store/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

const bulkInsertAssetsService = async (data: object) => {
    try {
        const response = await axiosInstance.post(`assets/bulk-insert`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

export {
    // Category-neutral exports — prefer these for new code.
    createAssetService,
    getAssetByIdService,
    updateAssetService,
    disposeAssetService,
    reassignAssetService,
    repairAssetService,
    completeRepairAssetService,
    listRepairDetailService,
    updateAssetImageService,
    removeAssetImageService,
    sendAssetToStoreService,
    bulkInsertAssetsService,

    // Legacy aliases (kept so existing callers compile while they migrate).
    createAssetService as createOfficeEquipmentService,
    createAssetService as createITEquipmentService,
    createAssetService as createFleetService,
    getAssetByIdService as getOfficeEquipmentByIDService,
    getAssetByIdService as getITEquipmentByIDService,
    getAssetByIdService as getFleetEquipmentByIDService,
    getAssetByIdService as getFleetByIDService,
    updateAssetService as updateOfficeEquipmentService,
    updateAssetService as updateITEquipmentService,
    updateAssetService as updateFleetEquipmentService,
    disposeAssetService as disposeOfficeEquipmentService,
    disposeAssetService as disposeITEquipmentService,
    disposeAssetService as disposeFleetService,
    reassignAssetService as reassignOfficeEquipmentService,
    reassignAssetService as reassignITEquipmentService,
    reassignAssetService as reassignFleetService,
    updateAssetImageService as updateOfficeEquipmentImageService,
    updateAssetImageService as updateITEquipmentImageService,
    updateAssetImageService as updateFleetImageService,
    removeAssetImageService as removeOfficeEquipmentImageService,
    removeAssetImageService as removeITEquipmentImageService,
    removeAssetImageService as removeFleetImageService,
    bulkInsertAssetsService as bulkInsertITAssetsService,
    bulkInsertAssetsService as bulkInsertOfficeAssetsService,
    bulkInsertAssetsService as bulkInsertFleetService,
};
