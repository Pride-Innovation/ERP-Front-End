/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useRef, useState } from "react";
import { Control, useController, useWatch } from "react-hook-form";
import OfficeEquipmentUtills from "./formUtills";
import { normaliseUnit, unitOptions, useUnitsOfMeasure } from "../../settings/unitsOfMeasure/unitsOfMeasure";
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

/**
 * Fills the asset's Unit of Measure from its commodity - the default decided with V34, which an asset
 * may then differ from.
 *
 * <p>The unit follows the commodity when one is chosen, and again whenever it changes. A form that
 * opens with a unit already set (an asset being edited) keeps it; one that opens without (a received
 * or imported asset with none) is filled in. Renders nothing.
 */
const UnitFromCommodity = ({ control }: { control: Control<any> }) => {
    const category = useWatch({ control, name: 'category' });
    const { field } = useController({ control, name: 'unitOfMeasure' });
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const previous = useRef<unknown>(undefined);

    useEffect(() => {
        const commodity = commodities?.find((c) => String(c.id) === String(category));
        const unit = normaliseUnit(commodity?.groupName);
        const changed = previous.current !== undefined && String(previous.current ?? '') !== String(category ?? '');
        if (category !== undefined) previous.current = category;
        if (!unit) return;
        if (changed || !normaliseUnit(field.value)) field.onChange(unit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, commodities]);

    return null;
};

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

    // Units come from Settings → Units of Measure; the asset's own unit stays selectable even if it
    // has since been switched off, or the field would open empty.
    const { units } = useUnitsOfMeasure();
    const currentUnit = useWatch({ control: control as any, name: 'unitOfMeasure' }) as string | undefined;

    const configuredFormFields = applyToFormFields(formFields)
        .filter(field => field.value !== (useTypedReference ? 'lpoNumber' : 'lpoReference'))
        .map(field => (isUpdate && field.value === 'lpoNumber' ? { ...field, required: false } : field))
        .map(field => (field.value === 'unitOfMeasure' ? { ...field, options: unitOptions(units, currentUnit) } : field));

    return (
        <>
        <UnitFromCommodity control={control as any} />
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
        </>
    );
};

export default OfficeEquipmentForm;