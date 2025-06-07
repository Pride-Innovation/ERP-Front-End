/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Card, CardContent, Grid } from '@mui/material';
import React from 'react';
import { IStore } from './interface';
import TabComponent from '../../components/tabs';
import { grey } from '@mui/material/colors';

interface BranchStoreReportProps {
    storeData: IStore[];
}

const BranchStoreReport: React.FC<BranchStoreReportProps> = ({ storeData }) => {
    console.log(storeData, "Store Data")
    return (
        <Box sx={{ p: 2, width: '100%' }}>
            <Grid item xs={12} >
                <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                    <CardContent>
                        <TabComponent
                            headers={[
                                {
                                    label: "Other Details",
                                    position: 0,
                                    content: <p>First content</p>
                                },
                                {
                                    label: "Request Commodities",
                                    position: 1,
                                    content: <p>Second Content</p>
                                },
                                {
                                    label: "Request Reports",
                                    position: 2,
                                    content: <p>Third Content</p>
                                }
                            ]}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    );
};

export default BranchStoreReport;
