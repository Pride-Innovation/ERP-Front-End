/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Stack,
    Typography,
    Paper,
    useTheme,
    alpha,
    Alert
} from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IAssetAxiosResponse, IDispose } from "./interface";
import {
    Assignment as AssetIcon,
    DeleteForever as DeleteIcon,
    Fingerprint as FingerprintIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { toast } from "react-toastify";
import axiosInstance from "../../core/apis/axiosInstance";
import { disposeGeneralAssetFromStore } from "./general/slice";

const Dispose = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
    module
}: IDispose) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>()

    const handleDisposal = async () => {
        try {
            // The legacy per-category dispose services all POST to the same
            // `assets/{id}` endpoint, so we hit it directly here.
            const response = await axiosInstance.post(`assets/${asset?.id}`) as IAssetAxiosResponse;

            if (response.status === 201) {
                toast.success("Asset disposed successfully");
                // Remove the disposed asset from the unified store (every
                // category lives in GeneralAssetStore now).
                dispatch(disposeGeneralAssetFromStore(asset?.id));
            }
        } catch (error) {
            console.log(error, "Error Message")
        } finally {
            handleClose()
        }
    }

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
            }}
        >
            {/* Top accent bar */}
            <Box sx={{ height: 3, bgcolor: theme.palette.error.main }} />

            <Box
                sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    py: 1.75,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                }}
            >
                <Box sx={{
                    width: 34, height: 34, borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.error.main, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <DeleteIcon sx={{ color: theme.palette.error.main, fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.error.main, lineHeight: 1.2 }}>
                        Asset Disposal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        This action is permanent and cannot be reversed
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Alert
                    severity="warning"
                    icon={<WarningIcon />}
                    sx={{
                        mb: 3,
                        borderRadius: 1.5,
                        '& .MuiAlert-icon': {
                            color: theme.palette.warning.dark
                        }
                    }}
                >
                    <Typography variant="body2" fontWeight={500}>
                        This action cannot be undone. The asset will be permanently marked as disposed.
                    </Typography>
                </Alert>

                <Grid container spacing={3}>
                    {/* Asset Information Section */}
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.error.main, 0.02),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.08)}`,
                                borderLeft: `3px solid ${alpha(theme.palette.error.main, 0.45)}`,
                                mb: 1
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                                Are you sure you want to dispose of the following asset?
                            </Typography>

                            <Stack spacing={2.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 0.8,
                                            borderRadius: 1,
                                            boxShadow: `0 3px 6px ${alpha(theme.palette.primary.main, 0.25)}`
                                        }}
                                    >
                                        <AssetIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Asset Name
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                            {asset.assetName}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                                            color: theme.palette.grey[600],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 0.8,
                                            borderRadius: 1
                                        }}
                                    >
                                        <FingerprintIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Engraved Number
                                        </Typography>
                                        {asset.engravedNumber ? (
                                            <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                                {asset.engravedNumber}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                                Not specified
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {asset.branch && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                                color: theme.palette.info.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.8,
                                                borderRadius: 1
                                            }}
                                        >
                                            <AssetIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                Branch Location
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                                {asset.branch?.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Stack direction="row" spacing={2}>
                        <ButtonComponent
                            handleClick={handleClose}
                            buttonColor='info'
                            type='button'
                            variant="outlined"
                            sendingRequest={false}
                            buttonText="Cancel"
                        />
                        <ButtonComponent
                            buttonColor='error'
                            type='submit'
                            sendingRequest={sendingRequest}
                            handleClick={handleDisposal}
                            buttonText={buttonText}
                        // startIcon={<DeleteIcon />}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Dispose;