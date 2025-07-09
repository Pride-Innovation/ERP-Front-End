import { useEffect, useState } from "react";
import {
    Grid,
    Stack,
    Typography,
    TextField,
    CircularProgress,
    useTheme,
} from "@mui/material";
import {
    IAcknowledegeRequest,
    IAcknowledgeRequesttAxiosResponse,
    IRequestAxiosResponse
} from "../interface"
import { ICommodity } from "../../settings/commodity/interface";
import { acknowledgeRequestService, findAssetRequestByIDService } from "./service";
import { toast } from "react-toastify";
import ButtonComponent from "../../../components/forms/Button";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import AssetTable from "../../../components/assetTable";

const AcknowledgeRequest = ({
    request,
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText
}: IAcknowledegeRequest) => {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);
    const theme = useTheme();

    const fetchRequestCommodities = async () => {
        setLoading(true);
        try {
            const response = (await findAssetRequestByIDService(
                request.id as number
            )) as IRequestAxiosResponse;

            if (
                response.status === 200 &&
                (response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>)?.length > 0
            ) {
                setRequestCommodities(response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>);
            } else {
                setRequestCommodities([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load commodities.");
            setRequestCommodities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestCommodities();
    }, []);

    const handleRequestAcknowledgement = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before approving.");
            return;
        }

        setSendingRequest(true);
        try {

            /**
             * NB: Please note that the status ID must match the Acknowledege Request Status ID in the Database.
             */

            const data = {
                requestId: request.id,
                statusId: 4, // Acknowledge Request Status ID
                comment
            }

            const response = await acknowledgeRequestService(data) as IAcknowledgeRequesttAxiosResponse;
            if (response.status === 201) {
                toast.success("Request acknowledged successfully.");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };
    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to Acknowledge Request Receipt?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <ThumbUpOffAltIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {request.name}
                    </Typography>
                </Stack>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                    {request.description}
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.secondary.main }}>
                    Requested Commodities:
                </Typography>
                {loading ? (
                    <Stack alignItems="center" sx={{ mt: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant="caption" sx={{ mt: 1 }}>
                            Loading commodities...
                        </Typography>
                    </Stack>
                ) : requestCommodities.length > 0 ? (
                    <AssetTable commodities={requestCommodities} />
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No commodities found for this request.
                    </Typography>
                )}
            </Grid>

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Approval Comment"
                    variant="outlined"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Stack direction="row" spacing={3} sx={{ width: "50%" }}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="info"
                        type="button"
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Close"
                    />
                    <ButtonComponent
                        handleClick={handleRequestAcknowledgement}
                        buttonColor="primary"
                        type="submit"
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    )
}

export default AcknowledgeRequest