/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react'
import TableComponent from '../../../components/tables/TableComponent';
import IndividualRequestUtill from './utill';
import { fetchRowsService } from '../../../core/apis/globalService';
import { IAssetsAxiosResponse } from '../../assets/interface';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { AssetContext } from '../../../context/asset';
import { loadAllGeneralAssets } from '../../assets/general/slice';
import { ErrorMessage } from '../../../utils/constants';
import { useSelector } from 'react-redux';
import AssetUtills from '../../assets/Utills';
import AssetTypeUtills from '../../settings/assetTypes/utills';
import RoutesUtills from '../../../core/routes/utills';
import { IAssetType } from '../../settings/assetTypes/interface';

const PersonalAssets = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const dispatch = useDispatch<AppDispatch>();
    const { setItEquipmentCount, itEquipmentCount } = useContext(AssetContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { currentAssetType, setCurrentAssetType } = AssetUtills()
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { getCurrentUser } = RoutesUtills();
    // All asset categories now share the same store (per the unified routing
    // refactor); this dashboard filters by the "IT Equipment" type below.
    const { generalAssets } = useSelector((state: RootState) => state.GeneralAssetStore);

    const {
        endPoint,
        columnHeaders,
        header,
        handleITEquipmentTableData,
        iTEquipmentTableData
    } = IndividualRequestUtill();


    const fetchResources = async () => {
        setLoading(true)
        const params = {
            assetTypeId: currentAssetType.id,
            assignedToId: getCurrentUser().id
        };

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IAssetsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllGeneralAssets(response.data.content));
                setItEquipmentCount(response.data.totalElements)
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
            const itType = assetTypes.find(t =>
                (t.name ?? '').toLocaleLowerCase().includes('it equipment')
            ) as IAssetType | undefined;
            if (itType) setCurrentAssetType(itType);
        }
    }, [assetTypes]);

    useEffect(() => { fetchAllAssetTypes() }, [])

    useEffect(() => {
        if (generalAssets.length > 0) {
            handleITEquipmentTableData(generalAssets as any)
        }
    }, [generalAssets])

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={itEquipmentCount}
            header={header}
            rows={iTEquipmentTableData || []}
            columnHeaders={columnHeaders}
            paginationMode='server'
            params={{
                assetTypeId: currentAssetType.id,
                assignedToId: getCurrentUser().id
            }}

        />
    )
}

export default PersonalAssets
