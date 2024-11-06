import React from "react";
import { IRequestDetails } from "./interface";
import { Box, CardMedia, Divider, Grid, Stack, Typography, useTheme } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import ButtonComponent from "../../components/forms/Button";
import PlaceHolder from "../../statics/images/Placeholder.png";

const RequestDetails: React.FC<IRequestDetails> = ({ handleClose, data }) => {
    const theme = useTheme();
    const { user, reason, quantity, status, description, date } = data;

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
                        {user?.department && (
                            <Typography variant="body1" fontWeight={500}>
                                <strong>Department:</strong> {user.department}
                            </Typography>
                        )}

                        <Typography variant="h6" fontWeight={600}>
                            <strong>Requested By:</strong> {user?.firstName + " " + user?.lastName}
                        </Typography>

                        <Typography variant="body1" fontWeight={500}>
                            <strong>Reason:</strong> {reason}
                        </Typography>

                        <Typography variant="body1" fontWeight={500}>
                            <strong>Quantity:</strong> {quantity}
                        </Typography>

                        <Typography variant="body1" fontWeight={500}>
                            <strong>Date:</strong> {date}
                        </Typography>

                        {status && (
                            <Typography variant="body1" fontWeight={500} sx={{ display: "flex", alignItems: "center" }}>
                                <strong>Status:</strong>
                                {status === 'approved' ? (
                                    <>
                                        <CheckCircle sx={{ color: 'green', marginRight: 1 }} />
                                        Approved
                                    </>
                                ) : status === 'pending' ? (
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
                    <Typography variant="body1" fontWeight={500}>
                        <strong>Description:</strong> {description}
                    </Typography>
                </Grid>
            </Grid>

            <Divider sx={{ marginTop: 3, marginBottom: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                <Stack direction="row" spacing={3} sx={{ width: status === "pending" ? "30%" : "20%", mt: 2 }}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="info"
                        type="button"
                        variant="contained"
                        sendingRequest={false}
                        buttonText="Back"
                    />
                    {status === "pending" && <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="success"
                        type="button"
                        sendingRequest={false}
                        buttonText="Approve"
                    />}
                </Stack>
            </Box>
        </Box>
    );
};

export default RequestDetails;
