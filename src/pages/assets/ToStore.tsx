/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
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
import { useEffect, useMemo, useState } from "react";
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
import { noApproverError } from "../movement/constants";
import NoApproverDialog from "../movement/NoApproverDialog";

interface IStoreOption {
    id: number;
    name: string;
    storeType: string;
    locationName?: string;
}

/** The stores a loaner may be kept in - the only ones the temporary-replacement picker reads. */
const LOANER_STORE_TYPES = ['IT', 'ADMIN'];

/**
 * Hands an asset back into a store — the single action that actually puts an asset *in* a store.
 *
 * <p>It replaces two half-finished ones. The old "Send to Store" cleared the holder and set a
 * status but never recorded which store the asset went into, so it ended up in none; the separate
 * "Temporary Pool" modal only flipped a flag without moving anything. Because the replacement
 * picker finds pool assets by the store holding them, neither could ever produce a usable one.
 * Marking an asset as pool stock now travels with the move that makes it meaningful.
 *
 * <p><b>The switch decides what the asset becomes, and where it goes by default.</b>
 * <ul>
 *   <li>Off — "Sent to Store", in the Admin store where it stands unless another is chosen. Parked:
 *       not offered for issuance or for loan until somebody decides what it is for.</li>
 *   <li>On — a loaner, "Available for Loan", in its category's loaner store (the IT store for IT
 *       categories) unless another IT or Admin store is chosen. Offered by Temporary Replacement and
 *       never by issuance.</li>
 * </ul>
 * The loaner default used to be the same Admin store as everything else, so an IT loaner received
 * with no store chosen landed where the IT store page never showed it.
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
    /** The server's explanation when the hand-back needs approval and nobody can give it. */
    const [noApprover, setNoApprover] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await axiosInstance.get('inventory/stores');
                setStores(Array.isArray(response.data) ? (response.data as IStoreOption[]) : []);
            } catch {
                // Non-fatal: leaving the picker empty falls back to the server's default store.
                setStores([]);
            }
        })();
    }, []);

    // A loaner may only be kept where the pool is read from.
    const options = useMemo(
        () => (temporaryPool ? stores.filter((s) => LOANER_STORE_TYPES.includes(s.storeType)) : stores),
        [stores, temporaryPool],
    );
    useEffect(() => {
        if (temporaryPool && destination && !LOANER_STORE_TYPES.includes(destination.storeType)) {
            setDestination(null);
        }
    }, [temporaryPool, destination]);

    /*
     * What the server will pick when nothing is chosen, stated rather than implied. Mirrors
     * AssetService#loanerStoreFor and #resolveDefaultStoreFor; the server stays the authority.
     */
    const itRouted = (asset?.assetType?.repairDestination ?? 'IT') === 'IT';
    const itStore = stores.find((s) => s.storeType === 'IT');
    const defaultLabel = temporaryPool
        ? (itRouted ? (itStore?.name ?? 'the IT store') : 'the Head Office Admin store')
        : `the ${asset?.branch?.name ?? "asset's branch"} Admin store`;

    const send = async (bypassReason?: string) => {
        setSaving(true);
        try {
            const response = await axiosInstance.put(
                `assets/store/${asset?.id}`,
                {
                    storeId: destination?.id ?? null,
                    temporaryPool,
                    ...(bypassReason ? { proceedWithoutApproval: true, bypassReason } : {}),
                }
            ) as IAssetAxiosResponse;

            if (response.status === 201) {
                dispatch(updateGeneralAssetInStore(response.data));
                const where = destination?.name ?? defaultLabel;
                toast.success(temporaryPool
                    ? `Received into ${where} — now Available for Loan`
                    : `Received into ${where} — now Sent to Store`);
                setNoApprover(null);
                handleClose();
            }
        } catch (error: any) {
            /*
             * Most refusals are already shown by the shared request handler. This one is not: it
             * carries its own code, which tells that handler the caller deals with it - and this
             * dialog never did, so a hand-back across locations with no approver simply did nothing.
             */
            const message = noApproverError(error);
            if (message) setNoApprover(message);
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
            onConfirm={() => send()}
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

                {/* What it becomes - decided first, because it decides the default store below. */}
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
                                        Keep as a loaner (temporary replacement)
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {temporaryPool
                                            ? 'Becomes "Available for Loan": offered to lend while someone else\'s asset is away, never issued against a request.'
                                            : 'Becomes "Sent to Store": parked in the store until someone decides what it is for.'}
                                    </Typography>
                                </Box>
                            </Stack>
                        }
                    />
                </Box>

                {/* Destination */}
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.75 }}>
                        Destination Store
                    </Typography>
                    <Autocomplete
                        options={options}
                        value={destination}
                        onChange={(_, v) => setDestination(v)}
                        getOptionLabel={(s) => `${s.name}${s.storeType ? ` · ${s.storeType}` : ''}`}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="medium"
                                placeholder={`Default — ${defaultLabel}`}
                                helperText={temporaryPool
                                    ? 'Leave blank to use this category\'s loaner store. Loaners can only be kept in an IT or Admin store.'
                                    : 'Leave blank to use the Admin store of the branch holding this asset.'}
                                sx={fieldSx}
                            />
                        )}
                    />
                </Box>

                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                    It will go to <strong>{destination?.name ?? defaultLabel}</strong> and read{' '}
                    <strong>{temporaryPool ? 'Available for Loan' : 'Sent to Store'}</strong>.
                </Alert>
            </Stack>

            <NoApproverDialog
                open={!!noApprover}
                message={noApprover}
                busy={saving}
                handleClose={() => setNoApprover(null)}
                onConfirm={(reason) => send(reason)}
            />
        </ActionModalShell>
    );
}

export default ToStore;
