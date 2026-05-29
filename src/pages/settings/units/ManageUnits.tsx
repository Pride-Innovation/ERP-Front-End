/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';

import { IDepartment } from '../departments/interface';
import { IUnit, IUnitsAxiosResponse } from './interface';
import {
    getUnitsByDepartmentService,
    createUnitService,
    updateUnitService,
    deleteUnitService,
} from './service';

const PRIMARY = '#08796C';

interface IManageUnitsProps {
    department: IDepartment;
    handleClose: () => void;
}

const ManageUnits = ({ department, handleClose }: IManageUnitsProps) => {
    const [units, setUnits] = useState<IUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Inline form state — editingId === null means "create new".
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [groupEmail, setGroupEmail] = useState('');

    const departmentId = department.id as number;

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = (await getUnitsByDepartmentService(departmentId)) as IUnitsAxiosResponse;
            if (res?.status === 200) {
                setUnits(res.data.content ?? []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId]);

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setGroupEmail('');
    };

    const startEdit = (unit: IUnit) => {
        setEditingId(unit.id ?? null);
        setName(unit.name ?? '');
        setGroupEmail(unit.groupEmail ?? '');
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Unit name is required.');
            return;
        }
        setSaving(true);
        const body = { name: name.trim(), groupEmail: groupEmail.trim() || null, departmentId };
        const res = editingId
            ? await updateUnitService(body, editingId)
            : await createUnitService(body);
        setSaving(false);

        const status = (res as { status?: number })?.status;
        if (status === 200 || status === 201) {
            toast.success(editingId ? 'Unit updated.' : 'Unit created.');
            resetForm();
            fetchUnits();
        }
        // Errors are surfaced by the global axios interceptor toast.
    };

    const handleDelete = async (unit: IUnit) => {
        if (!unit.id) return;
        const res = await deleteUnitService(unit.id);
        const status = (res as { status?: number })?.status;
        if (status === 200 || status === 201) {
            toast.success('Unit deleted.');
            if (editingId === unit.id) resetForm();
            fetchUnits();
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GroupWorkOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                        Units — {department.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Units own a group mailbox; members can act on requests routed to that unit.
                    </Typography>
                </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Existing units */}
            <Box sx={{ mb: 2 }}>
                {loading ? (
                    <Stack alignItems="center" sx={{ py: 3 }}>
                        <CircularProgress size={22} sx={{ color: PRIMARY }} />
                    </Stack>
                ) : units.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                        No units yet. Add the first one below.
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {units.map((unit) => (
                            <Paper
                                key={unit.id}
                                elevation={0}
                                sx={{
                                    p: 1.25,
                                    borderRadius: 1.5,
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    bgcolor: editingId === unit.id ? alpha(PRIMARY, 0.04) : '#fff',
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }} noWrap>
                                        {unit.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: unit.groupEmail ? '#64748B' : '#94A3B8', fontStyle: unit.groupEmail ? 'normal' : 'italic' }} noWrap>
                                        {unit.groupEmail || 'No group email'}
                                    </Typography>
                                </Box>
                                <Tooltip title="Edit unit" arrow>
                                    <IconButton size="small" onClick={() => startEdit(unit)} sx={{ color: PRIMARY }}>
                                        <EditOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete unit" arrow>
                                    <IconButton size="small" onClick={() => handleDelete(unit)} sx={{ color: 'error.main' }}>
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* Create / edit form */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, border: `1px dashed ${alpha(PRIMARY, 0.3)}`, bgcolor: alpha(PRIMARY, 0.02) }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {editingId ? 'Edit unit' : 'Add a unit'}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
                    <TextField
                        size="small"
                        label="Unit name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ flex: 1 }}
                    />
                    <TextField
                        size="small"
                        label="Group email"
                        placeholder="infrastructure@pridebank.co.ug"
                        value={groupEmail}
                        onChange={(e) => setGroupEmail(e.target.value)}
                        sx={{ flex: 1.4 }}
                    />
                </Stack>
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                    {editingId && (
                        <MuiButton size="small" onClick={resetForm} startIcon={<CloseIcon />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                            Cancel edit
                        </MuiButton>
                    )}
                    <MuiButton
                        size="small"
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <AddIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' } }}
                    >
                        {saving ? 'Saving…' : editingId ? 'Update unit' : 'Add unit'}
                    </MuiButton>
                </Stack>
            </Paper>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                <MuiButton onClick={handleClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                    Done
                </MuiButton>
            </Stack>
        </Box>
    );
};

export default ManageUnits;
