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
import { IITEquipmentsAxiosResponse } from '../../assets/ITEquipment/interface';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { AssetContext } from '../../../context/asset';
import { loadAllITAssets } from '../../assets/ITEquipment/slice';
import { ErrorMessage } from '../../../utils/constants';
import { useSelector } from 'react-redux';
import ITEquipmentUtills from '../../assets/ITEquipment/utills';
import AssetUtills from '../../assets/Utills';
import AssetTypeUtills from '../../settings/assetTypes/utills';
import RoutesUtills from '../../../core/routes/utills';

const PersonalAssets = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { endPoint, columnHeaders, header } = IndividualRequestUtill();
    const dispatch = useDispatch<AppDispatch>();
    const { setItEquipmentCount, itEquipmentCount } = useContext(AssetContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { determineITAssetType } = ITEquipmentUtills();
    const { currentAssetType, setCurrentAssetType } = AssetUtills()
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { getCurrentUser } = RoutesUtills();

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
            }) as IITEquipmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllITAssets(response.data.content));
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
            const assetType = determineITAssetType()
            setCurrentAssetType(assetType);
        }
    }, [assetTypes]);

    useEffect(() => { fetchAllAssetTypes() }, [])

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={itEquipmentCount}
            header={header}
            rows={[]}
            columnHeaders={columnHeaders}
            paginationMode='server'
        />
    )
}

export default PersonalAssets