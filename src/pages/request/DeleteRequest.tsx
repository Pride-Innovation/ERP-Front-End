import { Grid, Stack, Typography } from '@mui/material'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { IDeleteRequest } from './interface';
import ButtonComponent from '../../components/forms/Button';
import GlobalRequestUtill from './utill';


const DeleteRequest = ({
    request,
    handleClose,
    sendingRequest,
    buttonText
}: IDeleteRequest) => {
    const { isIRequest, isITransportRequest } = GlobalRequestUtill();
    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete this request?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <HelpOutlineOutlinedIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {isIRequest(request) ? (
                            request.reason
                        ) : isITransportRequest(request) ? (
                            request.purpose
                        ) : (
                            "No relevant information available"
                        )}
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

export default DeleteRequest;