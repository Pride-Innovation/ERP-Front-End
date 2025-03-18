import { Grid, Stack, Typography } from '@mui/material'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { IDeleteRequest } from './interface';
import ButtonComponent from '../../components/forms/Button';
import GlobalRequestUtill from './utill';
import { deleteTranportRequestService } from './transportRequest/service';
import { toast } from 'react-toastify';
import TransportRequestUtills from './transportRequest/utills';
import { deleteAssetRequestService } from './assetRequest/service';
import RequestUtills from './assetRequest/utills';


const DeleteRequest = ({
    request,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText
}: IDeleteRequest) => {
    const { isIRequest, isITransportRequest } = GlobalRequestUtill();
    const { removeTransportRequestFromStore } = TransportRequestUtills()
    const { removeAssetRequestFromStore } = RequestUtills()
    const deleteTranportRequest = async () => {
        setSendingRequest(true)
        const response =
            isITransportRequest(request) ? await deleteTranportRequestService(request?.id as string) :
                await deleteAssetRequestService(request?.id as string)

        if (response?.status === "success") {
            isITransportRequest(request) ? removeTransportRequestFromStore(request) :
                removeAssetRequestFromStore(request)
            handleClose();
            toast.success(response?.data?.message)
        }
        setSendingRequest(false)

    }

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
                            request?.name
                        ) : isITransportRequest(request) ? (
                            request.purpose
                        ) : (
                            "No relevant information available"
                        )}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        <b>Request Description: </b>
                        {isIRequest(request) ? (
                            request?.description
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
                        handleClick={deleteTranportRequest}
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