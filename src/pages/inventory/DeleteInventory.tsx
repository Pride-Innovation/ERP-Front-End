/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography, Divider, useTheme } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { IDeleteInventory } from './interface';
import ButtonComponent from '../../components/forms/Button';
import { useContext } from 'react';
import { InventoryContext } from '../../context/inventory';

const DeleteInventory = ({
    handleClose,
    sendingRequest,
    buttonText
}: IDeleteInventory) => {
    const { currentInventory } = useContext(InventoryContext);
    const theme = useTheme();

    const handleDeactivate = (id: string | number) => {
        console.log(id, "id information!!");
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    Are you sure you want to deactivate this item?
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <AccountCircleOutlinedIcon color="primary" />
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
                        {currentInventory?.name}
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Unit of Measure: <b>{currentInventory?.unitOfMeasure?.toUpperCase()}</b>
                </Typography>

                <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="info"
                        type="button"
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Cancel"
                    />
                    <ButtonComponent
                        handleClick={() => handleDeactivate(currentInventory?.id as string)}
                        buttonColor="error"
                        type="submit"
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default DeleteInventory;
