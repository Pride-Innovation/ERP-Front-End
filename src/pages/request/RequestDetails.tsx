import React, { useEffect, useState } from "react";
import { Box, CardMedia, Divider, Grid, Stack, Typography, useTheme } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import PlaceHolder from "../../statics/images/Placeholder.png";
import ButtonComponent from "../../components/forms/Button";
import { IRequest, IRequestDetails, ITransportRequest } from "./interface";
import GlobalRequestUtill from "./utill";

const RequestDetails: React.FC<IRequestDetails> = ({ handleClose, data }) => {
    const [details, setDetails] = useState<IRequest | ITransportRequest>(data);
    const theme = useTheme();
    const { isIRequest, isITransportRequest } = GlobalRequestUtill();

    useEffect(() => {
        if (isIRequest(data)) {
            setDetails(data as IRequest);
        } else if (isITransportRequest(data)) {
            setDetails(data as ITransportRequest);
        }
    }, [data]);

    return (
        <Box sx={{ width: "100%" }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <CardMedia
                        component="img"
                        height="250"
                        image={PlaceHolder}
                        alt="Equipment Image"
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[2],
                            objectFit: "cover",
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Stack spacing={2} sx={{ padding: 1 }}>
                        {details.user?.department && (
                            <Typography variant="body1" fontWeight={500}>
                                <strong>Department:</strong> {details.user.department}
                            </Typography>
                        )}

                        <Typography variant="body1" fontWeight={600}>
                            <strong>Requested By:</strong> {details.user?.firstName + " " + details.user?.lastName}
                        </Typography>

                        <Typography variant="body1" fontWeight={500}>
                            <strong>Reason:</strong> {details?.reason}
                        </Typography>

                        {isIRequest(details) && (
                            <>
                                <Typography variant="body1" fontWeight={500}>
                                    <strong>Quantity:</strong> {details?.quantity}
                                </Typography>

                                <Typography variant="body1" fontWeight={500}>
                                    <strong>Date:</strong> {details?.date}
                                </Typography>
                            </>
                        )}

                        {isITransportRequest(details) && (
                            <>
                                <Typography variant="body1" fontWeight={500}>
                                    <strong>Destination:</strong> {details?.destination}
                                </Typography>

                                <Typography variant="body1" fontWeight={500}>
                                    <strong>Duration:</strong> {details?.duration}
                                </Typography>

                                <Typography variant="body1" fontWeight={500}>
                                    <strong>Priority:</strong> {details?.priority}
                                </Typography>
                            </>
                        )}

                        {details.status && (
                            <Typography variant="body1" fontWeight={500} sx={{ display: "flex", alignItems: "center" }}>
                                <strong>Status:</strong>
                                {details.status === 'approved' ? (
                                    <>
                                        <CheckCircle sx={{ color: 'green', marginRight: 1 }} />
                                        Approved
                                    </>
                                ) : details.status === 'pending' ? (
                                    <>
                                        <Error sx={{ color: 'orange', marginRight: 1 }} />
                                        Pending
                                    </>
                                ) : (
                                    <>
                                        <Error sx={{ color: 'red', marginRight: 1 }} />
                                        Rejected
                                    </>
                                )}
                            </Typography>
                        )}
                    </Stack>
                </Grid>

                <Grid item xs={12}>
                    {isIRequest(details) && (
                        <Typography variant="body1" fontWeight={500}>
                            <strong>Description:</strong> {details?.description}
                        </Typography>
                    )}
                </Grid>
            </Grid>

            <Divider sx={{ marginTop: 3, marginBottom: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                <Stack direction="row" spacing={3} sx={{ width: details.status === "pending" ? "30%" : "20%", mt: 2 }}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="info"
                        type="button"
                        variant="contained"
                        sendingRequest={false}
                        buttonText="Back"
                    />
                    {details.status === "pending" && (
                        <ButtonComponent
                            handleClick={handleClose}
                            buttonColor="success"
                            type="button"
                            sendingRequest={false}
                            buttonText="Approve"
                        />
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default RequestDetails;
