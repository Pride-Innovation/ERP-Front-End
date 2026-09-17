/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Autocomplete,
    Box,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { IAssetAxiosResponse, IToStore } from "./interface";
import StoreIcon from '@mui/icons-material/Store';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { toast } from "react-toastify";
import axiosInstance from "../../core/apis/axiosInstance";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { updateGeneralAssetInStore } from "./general/slice";
import { fieldSx } from "../../components/forms/Inputs";
import ActionModalShell, { ActionPoints, AssetIdentityCard } from "./ActionModalShell";

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
        <ActionModalShell
            tone="success"
            icon={<StoreIcon />}
            title="Receive Asset into Store"
            subtitle="Takes the asset off its holder and books it into a store"
            onCancel={handleClose}
            onConfirm={handleSendingAssetToStore}
            confirmText={buttonText}
            confirmIcon={<StoreIcon />}
            busy={sendingRequest || saving}
            busyText="Receiving..."
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        This hands the asset back into stores. The action:
                    </Typography>
                    <ActionPoints
                        tone="success"
                        points={[
                            'Books the asset into the chosen store',
                            'Closes its current assignment, so it is no longer held by anyone',
                            'Records the hand-back as a movement in the audit trail',
                        ]}
                    />
                </Box>

                <AssetIdentityCard asset={asset} />

                {/* Destination */}
                <Box>
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
                    p: 2, borderRadius: 1.5,
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
                                <Inventory2OutlinedIcon sx={{ fontSize: 17, color: theme.palette.warning.main }} />
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
            </Stack>
        </ActionModalShell>
    );
}

export default ToStore;
