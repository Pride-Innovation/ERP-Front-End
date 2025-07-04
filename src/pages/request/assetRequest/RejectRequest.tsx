/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ButtonComponent from "../../../components/forms/Button";
import { toast } from "react-toastify";
import { assetRequestApprovalRejectionService, findAssetRequestByIDService } from "./service";
import { ICommodity } from "../../settings/commodity/interface";
import { IRejectRequest, IRequestAxiosResponse } from "../interface";
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

const RejectRequest = ({
    setSendingRequest,
    handleClose,
    request,
    sendingRequest,
    buttonText,
}: IRejectRequest) => {
    const theme = useTheme();

    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);

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

    const handleRequestRejection = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before rejecting.");
            return;
        }

        setSendingRequest(true);
        try {

            /**
             * NB: Please note that the status ID must match the Rejected Status ID in the Database.
             */

            const data = {
                requestId: request.id,
                approverId: request.currentApprover?.id,
                statusId: 2, // ID 2 must match the Rejected Status ID in the Database
                comment
            }
            const response = await assetRequestApprovalRejectionService(data) as IRequestAxiosResponse;
            console.log(response, "Response!!")

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
                    Are you sure you want to reject this request?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <InventoryOutlinedIcon color="primary" />
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
                    label="Rejection Comment"
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
                        handleClick={handleRequestRejection}
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

export default RejectRequest;
