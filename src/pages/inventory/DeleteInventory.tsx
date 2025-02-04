import { Grid, Stack, Typography } from '@mui/material'
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
    const { currentInventory } = useContext(InventoryContext)

    const handleDeactivate = (id: string | number) => {
        console.log(id, "id information!!")
    }

    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to deactivate this Item?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <AccountCircleOutlinedIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {currentInventory.name}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        Unit of Measure: <b> {(currentInventory.unitOfMeasure).toUpperCase()}</b>
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
                        handleClick={() => handleDeactivate(currentInventory?.id as string)}
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

export default DeleteInventory