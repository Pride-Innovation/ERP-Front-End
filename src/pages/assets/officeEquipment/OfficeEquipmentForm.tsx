/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import OfficeEquipmentUtills from "./utills";
import { IOfficeEquipmentForm } from "./interface";
import BranchUtills from "../../settings/branch/utills";
import StatusUtills from "../../settings/statuses/Utills";
import UserUtils from "../../users/utils";
import AssetTypeUtills from "../../settings/assetTypes/utills";
import SupplierUtills from "../../settings/suppliers/Utills";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import CommodityUtills from "../../settings/commodity/utills";
import InventoryUtills from "../../inventory/Utills";
import SteppedOfficeEquipmentForm from "./SteppedOfficeEquipmentForm";

const OfficeEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    lpoParams,
    userParams,
    supplierParams,
    branchParams,
    trigger
}: IOfficeEquipmentForm) => {
    const [assetTypeId, setAssetTypeId] = useState<number | null>();
    const [loading, setLoading] = useState<boolean>(true);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const { formFields, determineOfficeAssetType } = OfficeEquipmentUtills();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllStatuses } = StatusUtills();
    const { fetchAllUsers } = UserUtils();
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { fetchAllSuppliers } = SupplierUtills();
    const { fetchAllCommodities } = CommodityUtills();
    const { fetchInventory } = InventoryUtills();

    // Fetch required data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchAllBranches(branchParams),
                    fetchAllStatuses(),
                    fetchAllUsers(userParams),
                    fetchAllAssetTypes(),
                    fetchAllSuppliers(supplierParams),
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
        if (assetTypes.length > 0) {
            const assetType = determineOfficeAssetType();
            if (assetType !== null) {
                setAssetTypeId(assetType.id as number);
            }
        }
    }, [assetTypes]);

    // Fetch commodities when asset type is determined
    useEffect(() => {
        if (assetTypeId) {
            fetchAllCommodities({ assetTypeId });
        }
    }, [assetTypeId]);

    return (
        <SteppedOfficeEquipmentForm
            formState={formState}
            control={control}
            register={register}
            buttonText={buttonText}
            sendingRequest={sendingRequest}
            formFields={formFields}
            isUpdate={!!lpoParams}
            loading={loading}
            trigger={trigger}
            lpoParams={lpoParams}
            userParams={userParams}
            supplierParams={supplierParams}
            branchParams={branchParams}
        />
    );
};

export default OfficeEquipmentForm;