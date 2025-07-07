import { useEffect, useState } from "react";
import {
    Grid,
    Stack,
    Typography,
    TextField,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    useTheme,
} from "@mui/material";
import { IAcknowledegeReceipt, IRequestAxiosResponse } from "../interface"
import { ICommodity } from "../../settings/commodity/interface";
import { findAssetRequestByIDService } from "./service";
import { toast } from "react-toastify";
import ButtonComponent from "../../../components/forms/Button";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

const AcknowledgeReceipt = ({
    request,
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText
}: IAcknowledegeReceipt) => {
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
             * NB: Please note that the status ID must match the Approved Status ID in the Database.
             */

            const data = {
                requestId: request.id,
                approverId: request.currentApprover?.id,
                statusId: 3, //  ID 3 must match the Approved Status ID in the Database
                comment
            }
            // const response = await assetRequestApprovalRejectionService(data) as IRequestAxiosResponse;
            // console.log(response, "Response!!")

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
                    Are you sure you want to approve this request?
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
                    <Paper
                        elevation={0}
                        sx={{ bgcolor: "transparent" }}
                    >
                        <Table
                            size="small"
                            sx={{ borderCollapse: "separate", borderSpacing: 0 }}
                        >
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        "& th": {
                                            borderBottom: "none",
                                            color: theme.palette.background.paper
                                        },
                                    }}
                                >
                                    <TableCell>Commodity</TableCell>
                                    <TableCell>Unit of Measure</TableCell>
                                    <TableCell>Asset Type</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requestCommodities.map((item, idx) => (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                            backgroundColor:
                                                idx % 2 === 0
                                                    ? theme.palette.action.hover
                                                    : "transparent",
                                            "& td": {
                                                borderBottom: "none",
                                            },
                                        }}
                                    >
                                        <TableCell>{item.commodity.name}</TableCell>
                                        <TableCell>{item.commodity.groupName}</TableCell>
                                        <TableCell>{item.commodity.assetType?.name}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
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

export default AcknowledgeReceipt