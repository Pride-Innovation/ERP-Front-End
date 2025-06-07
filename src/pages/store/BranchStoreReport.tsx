/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Card, CardContent, Grid } from '@mui/material';
import { IStore } from './interface';
import TabComponent from '../../components/tabs';
import { grey } from '@mui/material/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useEffect } from 'react';
import StoreUtills from './utillls';

interface BranchStoreReportProps {
    storeData: IStore[];
}

const BranchStoreReport: React.FC<BranchStoreReportProps> = ({ storeData }) => {
    const { handleTableColumns, tableHeaders } = StoreUtills();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    useEffect(() => { handleTableColumns(assetTypes) }, [assetTypes]);

    return (
        <Box sx={{ p: 2, width: '100%' }}>
            <Grid item xs={12} >
                <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                    <CardContent>
                        {tableHeaders.length > 0 && <TabComponent
                            headers={tableHeaders}
                        />}
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    );
};

export default BranchStoreReport;
