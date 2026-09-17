/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Alert, Autocomplete, Box, Button, Chip, Divider, Stack, TextField, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { toast } from 'react-toastify';
import ButtonComponent from '../../components/forms/Button';
import { autocompleteSx } from '../../components/forms/Autocomplete';
import { DropdownPopper, DropdownPaper, SectionLabel, modalCancelSx } from '../../components/forms/modalChrome';
import { refusal } from '../../core/apis/globalService';
import { brand, gold, neutral } from '../../utils/tokens';
import { IMovement } from './interface';
import { movementSourceLocationId, movementDestinationLocationId } from './constants';
import { IConsignment } from '../consignment/interface';
import {
    fetchOpenConsignmentsService, createConsignmentService, addMovementToConsignmentService,
} from '../consignment/service';

const PRIMARY = brand[500];
const GOLD = gold[500];

/** One end of the route. Same panel grammar as the consignment create form and the movement detail. */
const RoutePanel = ({ kind, name, accent, icon }: {
    kind: string; name?: string | null; accent: string; icon: React.ReactNode;
}) => (
    <Box
        sx={{
            flex: 1, minWidth: 0, p: 1.5, borderRadius: 2,
            bgcolor: alpha(accent, name ? 0.04 : 0),
            border: `1px ${name ? 'solid' : 'dashed'} ${alpha(accent, name ? 0.2 : 0.25)}`,
        }}
    >
        <Stack direction="row" spacing={0.75} alignItems="center" mb={0.4}>
            <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 14 } }}>{icon}</Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: accent, letterSpacing: '0.06em', fontSize: '0.62rem' }}>
                {kind}
            </Typography>
        </Stack>
        <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: name ? neutral[900] : neutral[400], fontSize: '0.84rem' }}
            noWrap
        >
            {name ?? 'Unknown'}
        </Typography>
    </Box>
);

/**
 * Puts this movement on a van.
 *
 * <p>The on-ramp from the movement side. Consolidation was previously reachable only from the
 * consignments page — open the right journey, then find this movement in its picker — while the
 * movement itself offered nothing but Dispatch. That steered every load towards being driven on its
 * own, which is the opposite of what a shared courier run is for.
 *
 * <p>Route is read off the movement rather than asked for: a consignment only accepts movements
 * whose ends match its own, so there is nothing to choose. Existing drafts on the route come first,
 * because joining one is the entire point — opening a second van to the same branch is the mistake
 * this is meant to prevent.
 */
const LoadOntoConsignmentModal = ({
    movement, handleClose, sendingRequest, setSendingRequest, onDone,
}: {
    movement: IMovement;
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: (v: boolean) => void;
    onDone: () => void | Promise<void>;
}) => {
    const [openConsignments, setOpenConsignments] = useState<IConsignment[]>([]);
    const [picked, setPicked] = useState<IConsignment | null>(null);
    const [loading, setLoading] = useState(true);

    const sourceLocationId = movementSourceLocationId(movement);
    const destLocationId = movementDestinationLocationId(movement);
    const sourceName = movement.sourceStore?.location?.name ?? movement.sourceUser?.branch?.name ?? null;
    const destName = movement.destStore?.location?.name ?? movement.recipientUser?.branch?.name ?? null;

    /*
     * Both ends must resolve before anything can be offered. An inter-location movement always has
     * them, but the guard keeps a malformed record from silently posting to `/consignments/open`
     * with undefined params and returning every draft in the system.
     */
    const routeKnown = sourceLocationId != null && destLocationId != null;

    useEffect(() => {
        if (!routeKnown) { setLoading(false); return; }
        (async () => {
            setLoading(true);
            try {
                const r = (await fetchOpenConsignmentsService(sourceLocationId!, destLocationId!)) as any;
                setOpenConsignments(r?.status === 200 ? r.data ?? [] : []);
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeKnown, sourceLocationId, destLocationId]);

    /** Adds the movement to `consignmentId`, reporting the server's own refusal if it has one. */
    const attach = async (consignmentId: number) => {
        const res = (await addMovementToConsignmentService(consignmentId, movement.id!)) as any;
        if (res?.status === 200) {
            toast.success('Loaded onto this consignment.');
            handleClose();
            await onDone();
            return true;
        }
        toast.error(refusal(res, 'That movement could not be loaded.'));
        return false;
    };

    const loadOntoExisting = async () => {
        if (!routeKnown) return;
        if (!picked?.id) {
            toast.warning('Pick the consignment this movement travels on.');
            return;
        }
        setSendingRequest(true);
        try {
            await attach(picked.id);
        } finally {
            setSendingRequest(false);
        }
    };

    /*
     * Opening a van and loading this movement onto it is one intent, so it is one action. Leaving
     * the user on an empty consignment to go and find this movement again is the round trip that
     * made consolidation unattractive in the first place.
     */
    const openNewAndLoad = async () => {
        if (!routeKnown) return;
        setSendingRequest(true);
        try {
            const res = (await createConsignmentService({
                sourceLocationId: sourceLocationId!,
                destLocationId: destLocationId!,
                remarks: null,
            })) as any;
            if (res?.status !== 200 && res?.status !== 201) {
                toast.error(refusal(res, 'Could not open a consignment for this route.'));
                return;
            }
            await attach(res.data.id);
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Stack spacing={2.5}>
            {/* Header band — the same tinted icon-chip introduction the other movement modals open with. */}
            <Stack
                direction="row" spacing={1.5} alignItems="flex-start"
                sx={{ p: 1.75, borderRadius: 2.5, bgcolor: alpha(PRIMARY, 0.04), border: `1px solid ${alpha(PRIMARY, 0.14)}` }}
            >
                <Box sx={{
                    width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY,
                }}
                >
                    <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.3 }}>
                        Load onto a consignment
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[600], fontSize: '0.78rem' }}>
                        Movement #{movement.id} then travels with the rest of the load — one courier, one dispatch
                        note, landed together. Its courier is captured when the consignment goes out.
                    </Typography>
                </Box>
            </Stack>

            <SectionLabel>Route</SectionLabel>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1.5 }} alignItems={{ sm: 'center' }}>
                <RoutePanel kind="FROM" name={sourceName} accent={PRIMARY} icon={<PlaceOutlinedIcon />} />
                <Box sx={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, alignSelf: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: neutral[100],
                }}
                >
                    <ArrowForwardIcon sx={{ fontSize: 14, color: neutral[400], transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
                </Box>
                <RoutePanel kind="TO" name={destName} accent={GOLD} icon={<FlagOutlinedIcon />} />
            </Stack>

            {!routeKnown ? (
                <Alert severity="warning" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                    This movement&apos;s start or destination location could not be resolved, so it cannot be matched
                    to a consignment. Dispatch it on its own instead.
                </Alert>
            ) : (
                <>
                    <SectionLabel>Consignment</SectionLabel>
                    <Autocomplete
                        options={openConsignments}
                        value={picked}
                        loading={loading}
                        fullWidth
                        getOptionLabel={(c) => c.reference ?? `Consignment #${c.id}`}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        onChange={(_, v) => setPicked(v)}
                        PopperComponent={DropdownPopper}
                        PaperComponent={DropdownPaper}
                        noOptionsText="No consignment is being loaded for this route yet"
                        renderOption={(props, c) => (
                            <Box component="li" {...props} key={c.id}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                            {c.reference ?? `Consignment #${c.id}`}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={<Inventory2OutlinedIcon sx={{ fontSize: 13 }} />}
                                        label={`${c.movementCount} on board`}
                                        size="small"
                                        sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }}
                                    />
                                </Stack>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label="Being loaded for this route" sx={autocompleteSx} />
                        )}
                    />

                    {!loading && openConsignments.length === 0 && (
                        <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                            Nothing is being loaded for this route yet. Open a consignment and this movement goes on
                            it — others heading the same way can join before it is dispatched.
                        </Alert>
                    )}
                </>
            )}

            <Divider sx={{ borderColor: '#EEF2F7' }} />
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="flex-end"
                spacing={1.5}
            >
                <Button variant="outlined" onClick={handleClose} sx={modalCancelSx}>
                    Cancel
                </Button>
                {routeKnown && (
                    <Button
                        variant="outlined"
                        onClick={openNewAndLoad}
                        disabled={sendingRequest}
                        sx={{
                            ...modalCancelSx,
                            borderColor: alpha(PRIMARY, 0.5),
                            color: PRIMARY,
                            '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                        }}
                    >
                        Open a new one &amp; load
                    </Button>
                )}
                {/* `sendingRequest` is this button's busy state — it swaps the label for
                    "Processing…" — so an unmet precondition is reported by the handler, not by
                    dressing the button up as working. */}
                <ButtonComponent
                    sendingRequest={sendingRequest}
                    buttonText="Load onto Consignment"
                    buttonColor="primary"
                    variant="contained"
                    type="button"
                    handleClick={loadOntoExisting}
                />
            </Stack>
        </Stack>
    );
};

export default LoadOntoConsignmentModal;
