/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    Autocomplete,
    Box,
    Stack,
    Typography,
    TextField,
    Button as MuiButton,
    IconButton,
    Divider,
    Paper,
    CircularProgress,
    Tooltip,
    alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

import { IDepartment } from '../departments/interface';
import { IUnit, IUnitsAxiosResponse } from './interface';
import { getUnitsByDepartmentService, fetchUnitsService, updateUnitService } from './service';
import { useDebounce } from '../../../hooks/useDebounce';
import { ROUTES } from '../../../core/routes/routes';
import { brand, neutral } from '../../../utils/tokens';

const PRIMARY = brand[500];

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        bgcolor: '#fff',
        '& fieldset': { borderColor: '#E2E8F0' },
        '&:hover fieldset': { borderColor: PRIMARY },
        '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
    },
};

interface IManageUnitsProps {
    department: IDepartment;
    handleClose: () => void;
}

const ManageUnits = ({ department, handleClose }: IManageUnitsProps) => {
    const navigate = useNavigate();
    const departmentId = department.id as number;

    const [units, setUnits] = useState<IUnit[]>([]);
    const [loading, setLoading] = useState(true);

    // Assign-existing-unit autocomplete state
    const [options, setOptions] = useState<IUnit[]>([]);
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<IUnit | null>(null);
    const [input, setInput] = useState('');
    const [adding, setAdding] = useState(false);
    const debouncedInput = useDebounce(input, 400);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = (await getUnitsByDepartmentService(departmentId)) as IUnitsAxiosResponse;
            if (res?.status === 200) setUnits(res.data.content ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId]);

    // Search all units; exclude those already assigned to this department.
    useEffect(() => {
        let active = true;
        const run = async () => {
            setSearching(true);
            try {
                const res = (await fetchUnitsService({
                    name: debouncedInput.trim() || undefined,
                    pageSize: 20,
                })) as IUnitsAxiosResponse;
                if (active && res?.status === 200) {
                    const all = res.data.content ?? [];
                    setOptions(all.filter((u) => u.department?.id !== departmentId));
                }
            } finally {
                if (active) setSearching(false);
            }
        };
        run();
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedInput, departmentId]);

    const handleAdd = async () => {
        if (!selected?.id) return;
        setAdding(true);
        const body = { name: selected.name, groupEmail: selected.groupEmail ?? null, departmentId };
        const res = await updateUnitService(body, selected.id);
        setAdding(false);
        const status = (res as { status?: number })?.status;
        if (status === 200 || status === 201) {
            toast.success(`“${selected.name}” added to ${department.name}.`);
            setSelected(null);
            setInput('');
            fetchUnits();
        }
        // errors surfaced by the axios interceptor
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GroupWorkOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.2 }}>
                        Units — {department.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                        Assign existing units to this department. Members act on requests routed to the unit.
                    </Typography>
                </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Assign an existing unit */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, border: `1px dashed ${alpha(PRIMARY, 0.3)}`, bgcolor: alpha(PRIMARY, 0.02), mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Add a unit
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
                    <Autocomplete<IUnit>
                        sx={{ flex: 1 }}
                        size="small"
                        options={options}
                        loading={searching}
                        value={selected}
                        onChange={(_, v) => setSelected(v)}
                        onInputChange={(_, v) => setInput(v)}
                        getOptionLabel={(o) => o.name}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        filterOptions={(x) => x}
                        noOptionsText={searching ? 'Searching…' : 'No units found — create one on the Units page'}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.id}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{option.name}</Typography>
                                    <Typography variant="caption" sx={{ color: neutral[500] }} noWrap>
                                        {option.groupEmail || 'No group email'}
                                        {option.department?.name ? ` · ${option.department.name}` : ''}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search units to add..."
                                sx={fieldSx}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {searching ? <CircularProgress size={14} sx={{ color: PRIMARY, mr: 0.5 }} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <MuiButton
                        variant="contained"
                        onClick={handleAdd}
                        disabled={!selected || adding}
                        startIcon={adding ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <AddIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', bgcolor: PRIMARY, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#065E53' } }}
                    >
                        {adding ? 'Adding…' : 'Add'}
                    </MuiButton>
                </Stack>
            </Paper>

            {/* Units in this department */}
            {loading ? (
                <Stack alignItems="center" sx={{ py: 3 }}>
                    <CircularProgress size={22} sx={{ color: PRIMARY }} />
                </Stack>
            ) : units.length === 0 ? (
                <Typography variant="body2" sx={{ color: neutral[500], fontStyle: 'italic', py: 1 }}>
                    No units in this department yet. Use the search above to add one.
                </Typography>
            ) : (
                <Stack spacing={1}>
                    {units.map((unit) => (
                        <Paper key={unit.id} elevation={0} sx={{ p: 1.25, borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.08)}`, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff' }}>
                            <Box sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <GroupWorkOutlinedIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[900] }} noWrap>{unit.name}</Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: unit.groupEmail ? neutral[500] : neutral[400] }}>
                                    <EmailOutlinedIcon sx={{ fontSize: 12 }} />
                                    <Typography variant="caption" sx={{ fontStyle: unit.groupEmail ? 'normal' : 'italic' }} noWrap>
                                        {unit.groupEmail || 'No group email'}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            )}

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Tooltip title="Create and edit units" arrow>
                    <MuiButton
                        onClick={() => navigate(ROUTES.UNITS)}
                        startIcon={<OpenInNewOutlinedIcon fontSize="small" />}
                        sx={{ textTransform: 'none', color: PRIMARY, fontWeight: 600 }}
                    >
                        Open Units page
                    </MuiButton>
                </Tooltip>
                <MuiButton onClick={handleClose} sx={{ textTransform: 'none', color: neutral[600] }}>
                    Done
                </MuiButton>
            </Stack>
        </Box>
    );
};

export default ManageUnits;
