/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import CommodityUtills from './utills';
import { ICommodityAxiosResponse, IDeleteCommodity } from './interface';
import { toast } from 'react-toastify';
import { deleteCommodityService } from './service';
import { Grid, Stack, Typography } from '@mui/material';
import ButtonComponent from '../../../components/forms/Button';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';


const DeleteCommodity = ({
    sendingRequest,
    setSendingRequest,
    commodity,
    handleClose,
    buttonText
}: IDeleteCommodity) => {
    const { removeCommodityFromStore } = CommodityUtills();

    const deleteBranch = async () => {
        setSendingRequest(true)
        try {
            const response = await deleteCommodityService(commodity?.id as string) as ICommodityAxiosResponse;
            if (response.status === 204) {
                toast.success("Commodity deleted successfully")
                removeCommodityFromStore(commodity)
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
        handleClose()
    }

    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete this Commodity?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <CategoryOutlinedIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {commodity.name}
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
                        handleClick={deleteBranch}
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

export default DeleteCommodity