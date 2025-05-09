/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IDeleteSupplier } from './interface'
import { Grid, Stack, Typography } from '@mui/material'
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import ButtonComponent from '../../../components/forms/Button';
import SupplierUtills from './Utills';
import { toast } from 'react-toastify';
import { deleteSupplierService } from './service';

const DeleteSupplier = ({
    sendingRequest,
    supplier,
    handleClose,
    buttonText,
    setSendingRequest
}: IDeleteSupplier) => {
    const { removeSupplierToStore } = SupplierUtills();

    const deleteSupplier = async () => {
        setSendingRequest(true)
        const response = await deleteSupplierService(supplier?.id as string);
        setSendingRequest(false)
        if (response?.status === "success") {
            removeSupplierToStore(supplier)
            handleClose();
            toast.success(response?.data?.message)
        }
    }
    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete this Supplier?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <ProductionQuantityLimitsIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {supplier.name}
                    </Typography>
                </Stack>
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                <Stack direction="row" spacing={3} sx={{ width: "50%" }}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor='info'
                        type='button'
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Close"
                    />
                    <ButtonComponent
                        handleClick={deleteSupplier}
                        buttonColor='error'
                        type='submit'
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    )
}

export default DeleteSupplier