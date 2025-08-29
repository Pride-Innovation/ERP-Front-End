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
    alpha
} from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IAssetAxiosResponse, IToStore } from "./interface";
import {
    Assignment as AssetIcon,
    Store as StoreIcon,
    Fingerprint as FingerprintIcon,
    LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { toast } from "react-toastify";
import { sendAssetToStoreService } from "./ITEquipment/service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { updateITAsset } from "./ITEquipment/slice";
import { assetTypesStatusConstants } from "../../utils/constants";
import { updateOfficeAsset } from "./officeEquipment/slice";

const ToStore = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
    module
}: IToStore) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const handleSendingAssetToStore = async () => {
        try {
            const response = module === assetTypesStatusConstants.itEquipment
                ? await sendAssetToStoreService(asset?.id as number) as IAssetAxiosResponse
                : await sendAssetToStoreService(asset?.id as number) as IAssetAxiosResponse;

            if (response.status === 201) {
                module === assetTypesStatusConstants.itEquipment
                    ? dispatch(updateITAsset(response.data))
                    : dispatch(updateOfficeAsset(response.data));
                toast.success("Asset sent to store successfully");
            }
        } catch (error) {
            console.error("Error sending asset to store:", error);
        } finally {
            handleClose();
        }
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
            }}
        >
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    py: 1.5,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <StoreIcon color="success" />
                <Typography variant="subtitle1" fontWeight={600} color="success.main">
                    Send Asset to Store
                </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.background.default, 0.7),
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                mb: 1
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                                Are you sure you want to send this asset to the <strong>Store</strong>?
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
                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                color: theme.palette.success.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.8,
                                                borderRadius: 1
                                            }}
                                        >
                                            <StoreIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                Current Location
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                                {asset.branch?.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>

                        <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 1.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <ShippingIcon color="success" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                    This asset will be moved to the central store inventory and will no longer be
                                    assigned to its current location or user.
                                </Typography>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>

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
                            buttonColor='success'
                            type='submit'
                            sendingRequest={sendingRequest}
                            handleClick={handleSendingAssetToStore}
                            buttonText={buttonText}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ToStore;