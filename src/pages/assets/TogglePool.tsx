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
    Stack,
    Typography,
    Paper,
    useTheme,
    alpha
} from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IAssetAxiosResponse, ITogglePool } from "./interface";
import {
    Assignment as AssetIcon,
    Fingerprint as FingerprintIcon,
    Inventory2Outlined as PoolIcon
} from '@mui/icons-material';
import { toast } from "react-toastify";
import axiosInstance from "../../core/apis/axiosInstance";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { updateGeneralAssetInStore } from "./general/slice";

const TogglePool = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
    module
}: ITogglePool) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const isPool = asset.temporaryPool === true;

    const handleToggle = async () => {
        try {
            const response = await axiosInstance.put(
                `assets/temporary-pool/${asset?.id}`
            ) as IAssetAxiosResponse;

            if (response.status === 201) {
                dispatch(updateGeneralAssetInStore(response.data));
                toast.success(isPool
                    ? "Asset removed from the temporary replacement pool"
                    : "Asset marked as temporary replacement pool stock");
            }
        } catch (error) {
            console.error("Error toggling temporary pool flag:", error);
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
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
        >
            {/* Top accent bar */}
            <Box sx={{ height: 3, bgcolor: theme.palette.warning.main }} />

            <Box
                sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.06),
                    py: 1.75,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`
                }}
            >
                <Box sx={{
                    width: 34, height: 34, borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.14),
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <PoolIcon sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#92400E', lineHeight: 1.2 }}>
                        {isPool ? 'Remove from Replacement Pool' : 'Mark as Replacement Pool Stock'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Controls whether this asset can be loaned out while another of its category is under repair
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.warning.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                        borderLeft: `3px solid ${alpha(theme.palette.warning.main, 0.5)}`,
                        mb: 1
                    }}
                >
                    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                        {isPool
                            ? 'This asset is currently pool stock. Removing it means it can no longer be picked as a temporary replacement.'
                            : 'Marking this asset as pool stock lets it be picked as a temporary replacement while an operational asset of the same category is being repaired.'}
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
                    </Stack>
                </Paper>

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
                            buttonColor='warning'
                            type='submit'
                            sendingRequest={sendingRequest}
                            handleClick={handleToggle}
                            buttonText={buttonText}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default TogglePool;
