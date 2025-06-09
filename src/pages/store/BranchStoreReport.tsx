/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Card, CardContent, Grid } from '@mui/material';
import { IStore, IStoresAxiosResponse } from './interface';
import TabComponent from '../../components/tabs';
import { grey } from '@mui/material/colors';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { useEffect } from 'react';
import StoreUtills from './utillls';
import { useDispatch } from 'react-redux';
import { loadAllStores } from './slice';
import { fetchRowsService } from '../../core/apis/globalService';

interface BranchStoreReportProps {
    storeData: IStore[];
}

const BranchStoreReport: React.FC<BranchStoreReportProps> = ({ storeData }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        handleTableColumns,
        tableHeaders,
        setCurrentUserBranch,
        branchId,
        setCurrentAssetType,
        currentAssetType,
        setStoreReportTableData,
        setSendingRequest
    } = StoreUtills();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    useEffect(() => { handleTableColumns(assetTypes) }, [assetTypes]);
    useEffect(() => { setCurrentUserBranch() }, [])

    const handleTabChange = (value: string | number) => {
        setStoreReportTableData([])
        if (tableHeaders.length > 0) {
            setCurrentAssetType(tableHeaders[value as number]);
        }
    }

    const fetchStoresCommoditiesPerBranchPerAsset = async () => {
        setSendingRequest(true)

        try {
            if (branchId && currentAssetType) {
                const params = {
                    branchId,
                    assetTypeId: currentAssetType.id
                }
                const response = await fetchRowsService({
                    pageNumber: 0,
                    pageSize: 10,
                    endPoint: "store",
                    params
                }) as IStoresAxiosResponse;
                if (response.status === 200) {
                    dispatch(loadAllStores(response.data.content))
                }
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)

    }

    useEffect(() => {
        if (currentAssetType.id !== null && branchId !== null) {
            fetchStoresCommoditiesPerBranchPerAsset()
        }
    }, [currentAssetType])

    return (
        <Box sx={{ p: 2, width: '100%' }}>
            <Grid item xs={12} >
                <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                    <CardContent>
                        {tableHeaders.length > 0
                            && <TabComponent
                                handleTabChange={handleTabChange}
                                headers={tableHeaders} />
                        }
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    );
};

export default BranchStoreReport;
