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
import { IOfficeEquipmentsAxiosResponse } from "../../assets/officeEquipment/interface";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { loadAllOfficeAssets } from "../../assets/officeEquipment/slice";
import { AssetContext } from "../../../context/asset";
import { ErrorMessage } from "../../../utils/constants";
import { useSelector } from "react-redux";
import OfficeEquipmentUtills from "../../assets/officeEquipment/utills";
import AssetTypeUtills from "../../settings/assetTypes/utills";

const DashboardOfficeAssets = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { currentAssetType, setCurrentAssetType } = AssetUtills()
    const { getCurrentUser } = RoutesUtills();
    const dispatch = useDispatch<AppDispatch>();
    const { officeEquipmentCount, setOfficeEquipmentCount } = useContext(AssetContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { officeAsset } = useSelector((state: RootState) => state.OfficeAssetStore)

    const {
        endPoint,
        columnHeaders,
        header,
        officeEquipmentTableData,
        handleOfficeEquipmentTableData
    } = DashboardOfficeAssetsUtills();

    const {
        determineOfficeAssetType
    } = OfficeEquipmentUtills();

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
            }) as IOfficeEquipmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllOfficeAssets(response.data.content));
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
            const assetType = determineOfficeAssetType()
            setCurrentAssetType(assetType);
        }
    }, [assetTypes]);

    useEffect(() => { fetchAllAssetTypes() }, [])

    useEffect(() => {
        if (officeAsset.length > 0) {
            handleOfficeEquipmentTableData(officeAsset)
        }
    }, [officeAsset])

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