/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import OfficeEquipmentUtills from "./formUtills";
import { IOfficeEquipmentForm } from "../interface";
import BranchUtills from "../../settings/branch/utills";
import StatusUtills from "../../settings/statuses/Utills";
import AssetTypeUtills from "../../settings/assetTypes/utills";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import CommodityUtills from "../../settings/commodity/utills";
import InventoryUtills from "../../inventory/Utills";
import SteppedOfficeEquipmentForm from "./SteppedAssetForm";
import { useAssetFieldConfig } from "../../../hooks/useAssetFieldConfig";

const OfficeEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    // Optional, and only the create page supplies them — see SteppedAssetForm.
    secondaryButtonText,
    onSecondaryIntent,
    sendingRequest,
    lpoParams,
    hasStockOrder,
    initialOptions,
    userParams,
    supplierParams,
    branchParams,
    trigger,
    overrideAssetTypeId
}: IOfficeEquipmentForm) => {
    const [assetTypeId, setAssetTypeId] = useState<number | null>();
    const [loading, setLoading] = useState<boolean>(true);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const { formFields, determineOfficeAssetType } = OfficeEquipmentUtills();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllStatuses } = StatusUtills();
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { fetchAllCommodities } = CommodityUtills();
    const { fetchInventory } = InventoryUtills();

    // Fetch required data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Supplier and Assigned To are not preloaded: their pickers search the server
                // themselves (see SteppedAssetForm).
                await Promise.all([
                    fetchAllBranches(branchParams),
                    fetchAllStatuses(),
                    fetchAllAssetTypes(),
                    fetchInventory(lpoParams)
                ]);
            } catch (error) {
                console.error("Error fetching form data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Determine asset type
    useEffect(() => {
        if (overrideAssetTypeId) {
            setAssetTypeId(overrideAssetTypeId);
        } else if (assetTypes.length > 0) {
            const assetType = determineOfficeAssetType();
            if (assetType) {
                setAssetTypeId(assetType.id as number);
            }
        }
    }, [assetTypes, overrideAssetTypeId]);

    // Fetch commodities when asset type is determined
    useEffect(() => {
        if (assetTypeId) {
            fetchAllCommodities({ assetTypeId });
        }
    }, [assetTypeId]);

    const { applyToFormFields } = useAssetFieldConfig(assetTypeId);
    const isUpdate = !!lpoParams;

    /*
     * One LPO slot, filled one of two ways:
     *   - create, or an asset received on a stock order → the order's LPO (read-only on update);
     *   - an asset with no order (imported) → an optional typed reference.
     * Showing both would offer an empty, locked "LPO Number" beside the box that can be filled in.
     * On update the order's LPO is never required — it cannot be changed, so it cannot be missing.
     */
    const useTypedReference = isUpdate && !hasStockOrder;
    const configuredFormFields = applyToFormFields(formFields)
        .filter(field => field.value !== (useTypedReference ? 'lpoNumber' : 'lpoReference'))
        .map(field => (isUpdate && field.value === 'lpoNumber' ? { ...field, required: false } : field));

    return (
        <SteppedOfficeEquipmentForm
            formState={formState}
            control={control}
            register={register}
            buttonText={buttonText}
            secondaryButtonText={secondaryButtonText}
            onSecondaryIntent={onSecondaryIntent}
            sendingRequest={sendingRequest}
            formFields={configuredFormFields}
            isUpdate={isUpdate}
            loading={loading}
            trigger={trigger}
            lpoParams={lpoParams}
            initialOptions={initialOptions}
            userParams={userParams}
            supplierParams={supplierParams}
            branchParams={branchParams}
        />
    );
};

export default OfficeEquipmentForm;