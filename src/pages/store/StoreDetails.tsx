/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Card,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useContext, useEffect } from 'react';
import { StoreContext } from '../../context/store';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ButtonComponent from '../../components/forms/Button';
import StoreUtills from './utillls';

const StoreDetails = () => {
    const { curentStoreData } = useContext(StoreContext);
    const { handleClose, fetchLastIssuedCommodity } = StoreUtills()

    useEffect(() => {
        if (curentStoreData.commodity.id) {
            fetchLastIssuedCommodity(curentStoreData.commodity.id)
        }

    }, [curentStoreData])

    return (
        <Card
            sx={{
                boxShadow: "none",
                width: "100%",
                bgcolor: 'white',
            }}
        >


            <Stack spacing={3}>
                <Box>
                    <Typography variant="h6" sx={{ color: '#08796C', mb: 1 }}>
                        Commodity Details
                    </Typography>

                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                            <CategoryOutlinedIcon sx={{ mr: 1, color: '#08796C' }} />
                            <Typography variant="body2">
                                <strong>Commodity:</strong> {curentStoreData.commodity.name}
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                            <LayersOutlinedIcon sx={{ mr: 1, color: '#08796C' }} />
                            <Typography variant="body2">
                                <strong>Unit of Measure:</strong> {curentStoreData.commodity.groupName}
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                            <DescriptionOutlinedIcon sx={{ mr: 1, color: '#08796C' }} />
                            <Typography variant="body2">
                                <strong>Asset Type:</strong> {curentStoreData?.commodity?.assetType?.name}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <Inventory2OutlinedIcon sx={{ mr: 1, color: '#08796C' }} />
                            <Typography variant="body2">
                                <strong>Quantity:</strong> {curentStoreData.quantity}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Divider textAlign="left">
                    <Typography sx={{ color: '#BC892C', fontWeight: 500 }} variant="subtitle2">
                        Branch Info
                    </Typography>
                </Divider>

                <Stack spacing={1}>
                    <Box display="flex" alignItems="center">
                        <LocationCityOutlinedIcon sx={{ mr: 1, color: '#BC892C' }} />
                        <Typography variant="body2">
                            <strong>Branch:</strong> {curentStoreData.branch.name}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                        <PhoneIphoneOutlinedIcon sx={{ mr: 1, color: '#BC892C' }} />
                        <Typography variant="body2">
                            <strong>Telephone:</strong> {curentStoreData.branch.telephone}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                        <EmailOutlinedIcon sx={{ mr: 1, color: '#BC892C' }} />
                        <Typography variant="body2">
                            <strong>Email:</strong> {curentStoreData.branch.email}
                        </Typography>
                    </Box>
                </Stack>

                <Box>
                    <Typography variant="h6" sx={{ color: '#08796C', mb: 1 }}>
                        Last Issued Details
                    </Typography>

                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                            <EventNoteOutlinedIcon sx={{ mr: 1, color: '#08796C' }} />
                            <Typography variant="body2">
                                <strong>Date Issued:</strong> N/A
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <PersonOutlineOutlinedIcon sx={{ mr: 1, color: '#08796C' }} />
                            <Typography variant="body2">
                                <strong>Issued To:</strong>  Sunday Odong - Gulu Branch
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="center" pt={2}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor='primary'
                        type='button'
                        variant='contained'
                        sendingRequest={false}
                        buttonText="Close"
                    />
                </Stack>
            </Stack>
        </Card>
    );
}

export default StoreDetails