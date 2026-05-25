/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import DashboardOfficeAssetsUtills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import AssetUtills from "../../assets/Utills";
import RoutesUtills from "../../../core/routes/utills";
import { fetchRowsService } from "../../../core/apis/globalService";
import { IAssetsAxiosResponse } from "../../assets/interface";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { loadAllGeneralAssets } from "../../assets/general/slice";
import { AssetContext } from "../../../context/asset";
import { ErrorMessage } from "../../../utils/constants";
import { useSelector } from "react-redux";
import AssetTypeUtills from "../../settings/assetTypes/utills";
import { IAssetType } from "../../settings/assetTypes/interface";

const DashboardOfficeAssets = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { currentAssetType, setCurrentAssetType } = AssetUtills()
    const { getCurrentUser } = RoutesUtills();
    const dispatch = useDispatch<AppDispatch>();
    const { officeEquipmentCount, setOfficeEquipmentCount } = useContext(AssetContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { fetchAllAssetTypes } = AssetTypeUtills();
    // Unified store — filtered by the "Office Equipment" asset type below.
    const { generalAssets } = useSelector((state: RootState) => state.GeneralAssetStore);

    const {
        endPoint,
        columnHeaders,
        header,
        officeEquipmentTableData,
        handleOfficeEquipmentTableData
    } = DashboardOfficeAssetsUtills();

    const fetchResources = async () => {
        setLoading(true)
        const params = {
            assetTypeId: currentAssetType.id,
            assignedToId: getCurrentUser().id
        };

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 5,
                endPoint,
                params
            }) as IAssetsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllGeneralAssets(response.data.content));
                setOfficeEquipmentCount(response.data.totalElements)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (currentAssetType.id) { fetchResources() }
    }, [currentAssetType])

    useEffect(() => {
        if (assetTypes.length > 0) {
            const officeType = assetTypes.find(t =>
                (t.name ?? '').toLocaleLowerCase().includes('office equipment')
            ) as IAssetType | undefined;
            if (officeType) setCurrentAssetType(officeType);
        }
    }, [assetTypes]);

    useEffect(() => { fetchAllAssetTypes() }, [])

    useEffect(() => {
        if (generalAssets.length > 0) {
            handleOfficeEquipmentTableData(generalAssets as any)
        }
    }, [generalAssets])

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={officeEquipmentCount}
            header={header}
            rows={officeEquipmentTableData || []}
            columnHeaders={columnHeaders}
            paginationMode='client'
            params={{
                assetTypeId: currentAssetType.id,
                assignedToId: getCurrentUser().id
            }}
        />
    )
}

export default DashboardOfficeAssets
