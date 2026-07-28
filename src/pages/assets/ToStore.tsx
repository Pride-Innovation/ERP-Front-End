/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Autocomplete,
    Box,
    Card,
    CardContent,
    Divider,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
    Paper,
    useTheme,
    alpha
} from "@mui/material";
import { useEffect, useState } from "react";
import ButtonComponent from "../../components/forms/Button";
import { IAssetAxiosResponse, IToStore } from "./interface";
import {
    Assignment as AssetIcon,
    Store as StoreIcon,
    Fingerprint as FingerprintIcon,
    LocalShipping as ShippingIcon,
    Inventory2Outlined as PoolIcon,
    PersonOutline as PersonIcon
} from '@mui/icons-material';
import { toast } from "react-toastify";
import axiosInstance from "../../core/apis/axiosInstance";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { updateGeneralAssetInStore } from "./general/slice";
import { fieldSx } from "../../components/forms/Inputs";

interface IStoreOption {
    id: number;
    name: string;
    storeType: string;
    locationName?: string;
}

/**
 * Hands an asset back into a store — the single action that actually puts an asset *in* a store.
 *
 * <p>It replaces two half-finished ones. The old "Send to Store" cleared the holder and set a
 * status but never recorded which store the asset went into, so it ended up in none; the separate
 * "Temporary Pool" modal only flipped a flag without moving anything. Because the replacement
 * picker finds pool assets by the store holding them, neither could ever produce a usable one.
 * Marking an asset as pool stock now travels with the move that makes it meaningful.
 */
const ToStore = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
}: IToStore) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const [stores, setStores] = useState<IStoreOption[]>([]);
    const [destination, setDestination] = useState<IStoreOption | null>(null);
    const [temporaryPool, setTemporaryPool] = useState<boolean>(asset?.temporaryPool === true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const response = await axiosInstance.get('inventory/stores');
                setStores((response.data as IStoreOption[]) ?? []);
            } catch {
                // Non-fatal: leaving the picker empty falls back to the asset's own branch store.
                setStores([]);
            }
        })();
    }, []);

    const handleSendingAssetToStore = async () => {
        setSaving(true);
        try {
            const response = await axiosInstance.put(
                `assets/store/${asset?.id}`,
                {
                    // Omitted, the server uses the ADMIN store of the branch holding the asset.
                    storeId: destination?.id ?? null,
                    temporaryPool,
                }
            ) as IAssetAxiosResponse;

            if (response.status === 201) {
                dispatch(updateGeneralAssetInStore(response.data));
                toast.success(temporaryPool
                    ? "Asset received into store and available for temporary issuance"
                    : "Asset received into store");
                handleClose();
            }
        } catch (error) {
            console.error("Error sending asset to store:", error);
        } finally {
            setSaving(false);
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
            {/* Top accent bar */}
            <Box sx={{ height: 3, bgcolor: theme.palette.success.main }} />

            <Box
                sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    py: 1.75,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                }}
            >
                <Box sx={{
                    width: 34, height: 34, borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <StoreIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.success.main, lineHeight: 1.2 }}>
                        Receive Asset into Store
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Takes the asset off its holder and books it into a store
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.08)}`,
                        borderLeft: `3px solid ${alpha(theme.palette.success.main, 0.45)}`,
                    }}
                >
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                bgcolor: theme.palette.primary.main, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                p: 0.8, borderRadius: 1,
                                boxShadow: `0 3px 6px ${alpha(theme.palette.primary.main, 0.25)}`
                            }}>
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
                            <Box sx={{
                                bgcolor: alpha(theme.palette.grey[500], 0.1), color: theme.palette.grey[600],
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                p: 0.8, borderRadius: 1
                            }}>
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

                        {asset.assignedTo && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    bgcolor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.dark,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    p: 0.8, borderRadius: 1
                                }}>
                                    <PersonIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Currently Held By
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                        {`${asset.assignedTo.firstName ?? ''} ${asset.assignedTo.lastName ?? ''}`.trim() || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </Paper>

                {/* Destination */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.75 }}>
                        Destination Store
                    </Typography>
                    <Autocomplete
                        options={stores}
                        value={destination}
                        onChange={(_, v) => setDestination(v)}
                        getOptionLabel={(s) => `${s.name}${s.storeType ? ` · ${s.storeType}` : ''}`}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="medium"
                                placeholder={`Default — ${asset.branch?.name ?? "the asset's branch"} Admin Store`}
                                helperText="Leave blank to use the Admin store of the branch holding this asset. Choose the IT store for repair pool stock."
                                sx={fieldSx}
                            />
                        )}
                    />
                </Box>

                {/* Pool flag — only meaningful once the asset is actually in a store */}
                <Box sx={{
                    mt: 2.5, p: 2, borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, temporaryPool ? 0.08 : 0.03),
                    border: `1px solid ${alpha(theme.palette.warning.main, temporaryPool ? 0.3 : 0.12)}`,
                    transition: 'all 0.2s ease',
                }}>
                    <FormControlLabel
                        control={
                            <Switch
                                color="warning"
                                checked={temporaryPool}
                                onChange={(e) => setTemporaryPool(e.target.checked)}
                            />
                        }
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PoolIcon sx={{ fontSize: 17, color: theme.palette.warning.main }} />
                                <Box>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        Available for temporary issuance
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Lets this asset be loaned out while someone else's is under repair
                                    </Typography>
                                </Box>
                            </Stack>
                        }
                    />
                </Box>

                <Box sx={{ mt: 2.5, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <ShippingIcon color="success" fontSize="small" sx={{ mt: 0.2 }} />
                        <Typography variant="body2" color="text.secondary">
                            The asset is booked into the store, its current assignment is closed, and the
                            hand-back is recorded as a movement so it appears in the audit trail.
                        </Typography>
                    </Stack>
                </Box>

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
                            sendingRequest={sendingRequest || saving}
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
