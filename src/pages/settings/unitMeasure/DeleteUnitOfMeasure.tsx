import { Grid, Stack, Typography } from '@mui/material'
import ScaleIcon from '@mui/icons-material/Scale';
import ButtonComponent from '../../../components/forms/Button';
import { IDeleteUnitOfMeasure } from './interface';

const DeleteUnitOfMeasure = ({
    unitOfMeasure,
    sendingRequest,
    buttonText,
    handleClose
}: IDeleteUnitOfMeasure) => {
    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete this Unit of Measure?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <ScaleIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {unitOfMeasure.name}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        Symbol: {unitOfMeasure.symbol}
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

export default DeleteUnitOfMeasure