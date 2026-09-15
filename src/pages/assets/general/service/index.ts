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

// The flag-only dispose (POST assets/{id}) has been removed. It set `disposed` and a date but
// created no movement, moved no stock and changed no status, so an asset could read as disposed
// while still sitting in a branch store. Disposal now goes through `disposeAssetService` in
// pages/movement/service, which raises a DISPOSAL_TRANSFER and enforces the eligibility rules.

const reassignAssetService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.post(`assets/reassign/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
};

/*
 * There is no `repairAssetService` here any more.
 *
 * It posted to `POST /assets/repairs/{id}` - an endpoint that no longer exists, because booking an
 * asset in for repair now goes through `POST /movements/repair-transfer`, which actually moves the
 * asset. Worth knowing that this export was already dead before it was removed: the Repair modal
 * called axiosInstance directly rather than going through it.
 *
 * `completeRepairAssetService` (PUT) and `listRepairDetailService` (GET) stay - closing a repair on
 * the bench and reading an asset's maintenance history are real and separate duties.
 */

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

const listRepairDetailService = async (id: string | number, pageSize = 200) => {
    try {
        // Pull the full repair history in one page; the table pages client-side.
        const response = await axiosInstance.get(`assets/repairs/${id}`, { params: { pageSize } });
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

/**
 * Soft-deletes an asset — it leaves every listing but the row is kept.
 *
 * <p>Not disposal. Disposal is a business event under /movements: an asset reaching the end of its
 * life, written off and still counted in the register. This says the record should not have existed.
 */
const deleteAssetService = async (id: string | number, reason?: string) => {
    try {
        return await axiosInstance.delete(`assets/${id}`, {
            params: reason ? { reason } : undefined,
        });
    } catch (error) {
        return error;
    }
};

/**
 * How many deleted assets of this category the caller could restore.
 *
 * <p>Asked so the page can hide the deleted view when there is nothing in it. Branch-scoped on the
 * server, so the number always matches what the view would show.
 */
const countDeletedAssetsService = async (assetTypeId?: number | string) => {
    try {
        return await axiosInstance.get('assets/deleted-count', {
            params: assetTypeId ? { assetTypeId } : undefined,
        });
    } catch (error) {
        return error;
    }
};

/** Puts a soft-deleted asset back into the register. */
const restoreAssetService = async (id: string | number) => {
    try {
        return await axiosInstance.put(`assets/${id}/restore`);
    } catch (error) {
        return error;
    }
};

export {
    countDeletedAssetsService,
    deleteAssetService,
    restoreAssetService,
    // Category-neutral exports — prefer these for new code.
    createAssetService,
    getAssetByIdService,
    updateAssetService,
    reassignAssetService,
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
