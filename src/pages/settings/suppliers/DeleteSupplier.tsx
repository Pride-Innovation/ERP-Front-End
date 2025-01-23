import { IDeleteSupplier } from './interface'
import { Grid, Stack, Typography } from '@mui/material'
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import ButtonComponent from '../../../components/forms/Button';

const DeleteSupplier = ({
    sendingRequest,
    supplier,
    handleClose,
    buttonText
}: IDeleteSupplier) => {
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