/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

import { PageHero } from '../../../components/layout';
import usePermissions from '../../../core/permissions/usePermissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
import { refusal } from '../../../core/apis/globalService';
import { border, neutral, surface } from '../../../utils/tokens';
import {
    IUnitOfMeasure,
    createUnitOfMeasure,
    fetchUnitsOfMeasure,
    normaliseUnit,
    setUnitOfMeasureActive,
    unitLabel,
} from './unitsOfMeasure';

/**
 * Settings → Units of Measure: the list a commodity's unit, and an asset's, are chosen from.
 *
 * <p>Add and switch off only - no rename and no delete. Units are stored as text on the commodities
 * and assets that use them, so renaming one here would leave those records naming a unit the list no
 * longer has. Switching one off stops it being offered; every record already using it keeps it.
 */
const UnitsOfMeasure = () => {
    const { has } = usePermissions();
    const mayAdd = has(PERMISSIONS.CREATE_SETTING);
    const mayToggle = has(PERMISSIONS.UPDATE_SETTING);

    const [units, setUnits] = useState<IUnitOfMeasure[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setUnits(await fetchUnitsOfMeasure(true));
            setLoadError(null);
        } catch (error) {
            setLoadError(refusal(error, 'Could not load the units of measure.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const add = async (event: FormEvent) => {
        event.preventDefault();
        const name = normaliseUnit(newName);
        if (!name) return;
        setAdding(true);
        try {
            await createUnitOfMeasure(name);
            toast.success(`"${unitLabel(name)}" added.`);
            setNewName('');
            await load();
        } catch (error) {
            toast.error(refusal(error, 'Could not add this unit.'));
        } finally {
            setAdding(false);
        }
    };

    const toggle = async (unit: IUnitOfMeasure) => {
        setTogglingId(unit.id);
        try {
            const saved = await setUnitOfMeasureActive(unit.id, !unit.active);
            setUnits((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
            toast.success(`"${unitLabel(saved.name)}" switched ${saved.active ? 'on' : 'off'}.`);
        } catch (error) {
            toast.error(refusal(error, 'Could not change this unit.'));
        } finally {
            setTogglingId(null);
        }
    };

    const activeCount = units.filter((u) => u.active).length;

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Units of Measure"
                subtitle="The units a commodity or asset can be counted in"
                icon={<StraightenOutlinedIcon />}
            />

            <Alert severity="info" sx={{ mb: 2.5 }}>
                A commodity's unit is chosen from this list, and each new asset starts with its
                commodity's unit (it can be changed on the asset). Switching a unit off stops it
                being offered; commodities and assets already using it keep it.
            </Alert>

            {loadError && (
                <Alert severity="error" sx={{ mb: 2.5 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
                    {loadError}
                </Alert>
            )}

            {mayAdd && (
                <Paper
                    component="form"
                    onSubmit={add}
                    elevation={0}
                    sx={{ p: 2, mb: 2.5, border: `1px solid ${border.subtle}`, borderRadius: 2, bgcolor: surface.card }}
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                        <TextField
                            size="small"
                            label="New unit"
                            placeholder="e.g. cartons"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            inputProps={{ maxLength: 50 }}
                            sx={{ flex: 1, maxWidth: { sm: 360 } }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={adding ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
                            disabled={adding || !normaliseUnit(newName)}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Add unit
                        </Button>
                    </Stack>
                </Paper>
            )}

            <Paper elevation={0} sx={{ border: `1px solid ${border.subtle}`, borderRadius: 2, bgcolor: surface.card, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${border.subtle}` }}>
                    <Typography sx={{ fontSize: '0.875rem', color: neutral[600] }}>
                        {loading ? 'Loading…' : `${units.length} units · ${activeCount} offered`}
                    </Typography>
                </Box>

                {loading ? (
                    <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={22} /></Stack>
                ) : units.length === 0 && !loadError ? (
                    <Typography sx={{ p: 3, color: neutral[500], fontSize: '0.875rem' }}>No units yet.</Typography>
                ) : (
                    units.map((unit) => (
                        <Stack
                            key={unit.id}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ px: 2, py: 1, borderBottom: `1px solid ${border.subtle}`, '&:last-child': { borderBottom: 0 } }}
                        >
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: unit.active ? neutral[900] : neutral[500] }}>
                                    {unitLabel(unit.name)}
                                </Typography>
                                {!unit.active && <Chip size="small" label="Off" sx={{ height: 22, fontSize: '0.8rem' }} />}
                            </Stack>
                            <Switch
                                checked={unit.active}
                                disabled={!mayToggle || togglingId === unit.id}
                                onChange={() => toggle(unit)}
                                inputProps={{ 'aria-label': `${unit.active ? 'Switch off' : 'Switch on'} ${unit.name}` }}
                            />
                        </Stack>
                    ))
                )}
            </Paper>
        </Box>
    );
};

export default UnitsOfMeasure;
