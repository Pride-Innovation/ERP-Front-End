/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box,
    Button,
    Chip,
    Divider,
    Fade,
    IconButton,
    InputAdornment,
    Pagination,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { toast } from 'react-toastify';

import { PageHero } from '../../../components/layout';
import ModalComponent from '../../../components/modal';
import Loading from '../../../components/loading';
import { RequirePermission } from '../../../core/permissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
import { useDebounce } from '../../../hooks/useDebounce';
import { brand, neutral, border } from '../../../utils/tokens';
import { IUnit, IUnitsAxiosResponse } from './interface';
import { unitSchema } from './schema';
import UnitForm from './UnitForm';
import {
    fetchUnitsService,
    createUnitService,
    updateUnitService,
    deleteUnitService,
} from './service';

const PRIMARY = brand[500];
const PAGE_SIZE = 9;

interface IUnitFormValues {
    name: string;
    groupEmail?: string | null;
    departmentId?: number;
}

const Units = () => {
    const [units, setUnits] = useState<IUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageNumber, setPageNumber] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState<'create' | 'update' | 'delete' | ''>('');
    const [current, setCurrent] = useState<IUnit | null>(null);

    const debouncedSearch = useDebounce<string>(searchTerm, 500);

    const { control, handleSubmit, formState, register, reset } = useForm<IUnitFormValues>({
        mode: 'onChange',
        resolver: yupResolver(unitSchema) as any,
        defaultValues: { name: '', groupEmail: '', departmentId: undefined },
    });

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = (await fetchUnitsService({
                pageNumber,
                pageSize: PAGE_SIZE,
                name: debouncedSearch || undefined,
            })) as IUnitsAxiosResponse;
            if (res?.status === 200) {
                setUnits(res.data.content ?? []);
                setTotalPages(res.data.totalPages ?? 0);
                setTotalElements(res.data.totalElements ?? 0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNumber, debouncedSearch]);

    const hasActiveFilters = searchTerm !== '';
    const closeModal = () => { setModal(''); setCurrent(null); };

    const openCreate = () => {
        reset({ name: '', groupEmail: '', departmentId: undefined });
        setModal('create');
    };

    const openUpdate = (unit: IUnit) => {
        setCurrent(unit);
        reset({ name: unit.name, groupEmail: unit.groupEmail ?? '', departmentId: unit.department?.id });
        setModal('update');
    };

    const onSubmit = async (data: IUnitFormValues) => {
        setSending(true);
        const body = {
            name: data.name.trim(),
            groupEmail: data.groupEmail?.trim() || null,
            departmentId: data.departmentId,
        };
        const res = current
            ? await updateUnitService(body, current.id as number)
            : await createUnitService(body);
        setSending(false);
        const status = (res as { status?: number })?.status;
        if (status === 200 || status === 201) {
            toast.success(current ? 'Unit updated.' : 'Unit created.');
            closeModal();
            fetchUnits();
        }
        // errors are surfaced by the axios interceptor toast
    };

    const handleDelete = async () => {
        if (!current?.id) return;
        setSending(true);
        const res = await deleteUnitService(current.id);
        setSending(false);
        const status = (res as { status?: number })?.status;
        if (status === 200 || status === 201) {
            toast.success('Unit deleted.');
            closeModal();
            fetchUnits();
        }
    };

    const todayLabel = useMemo(
        () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        [],
    );

    return (
        <>
            {/* Create / Update modal */}
            {(modal === 'create' || modal === 'update') && (
                <ModalComponent width="55%" title={modal === 'create' ? 'Create Unit' : 'Update Unit'} open handleClose={closeModal}>
                    <form style={{ width: '100%' }} autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <UnitForm
                            register={register}
                            control={control}
                            formState={formState}
                            handleClose={closeModal}
                            sendingRequest={sending}
                            buttonText={modal === 'create' ? 'Create Unit' : 'Update Unit'}
                            isUpdate={modal === 'update'}
                        />
                    </form>
                </ModalComponent>
            )}

            {/* Delete modal */}
            {modal === 'delete' && (
                <ModalComponent width="40%" title="Delete Unit" open handleClose={closeModal}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha('#D32F2F', 0.1), color: '#D32F2F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <WarningAmberRoundedIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: neutral[900] }}>
                                    Delete “{current?.name}”?
                                </Typography>
                                <Typography variant="body2" sx={{ color: neutral[500], mt: 0.5 }}>
                                    This permanently removes the unit and its group mailbox routing. This cannot be undone.
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                            <Button onClick={closeModal} disabled={sending} sx={{ textTransform: 'none', borderRadius: '8px', color: neutral[600] }}>Cancel</Button>
                            <Button onClick={handleDelete} disabled={sending} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: '8px' }}>
                                {sending ? 'Deleting…' : 'Delete Unit'}
                            </Button>
                        </Stack>
                    </Box>
                </ModalComponent>
            )}

            <PageHero
                title="Unit Management"
                subtitle="Group mailboxes whose members act on requests routed to them"
                icon={<GroupWorkOutlinedIcon />}
                stat={{ value: totalElements ?? 0, label: 'records', helper: todayLabel }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                        <Button onClick={openCreate} startIcon={<AddIcon />} variant="contained"
                            sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
                            Add Unit
                        </Button>
                    </RequirePermission>
                }
            />

            {/* Filter bar */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search units..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(0); }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
                    sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
                />
                {hasActiveFilters && (
                    <Chip label="Clear filters" size="small" icon={<FilterListOffIcon fontSize="small" />}
                        onClick={() => { setSearchTerm(''); setPageNumber(0); }}
                        onDelete={() => { setSearchTerm(''); setPageNumber(0); }}
                        sx={{ borderRadius: '6px', fontWeight: 500 }} />
                )}
            </Stack>

            {/* Cards */}
            <Box sx={{ position: 'relative', minHeight: 200 }}>
                {loading ? (
                    <Paper elevation={0} sx={{ p: 4, display: 'flex', justifyContent: 'center', borderRadius: 2, border: `1px solid ${border.subtle}` }}>
                        <Loading items="units" />
                    </Paper>
                ) : units.length > 0 ? (
                    <Fade in={!loading}>
                        <Box className="settings-card-grid">
                            {units.map((unit) => (
                                <Paper key={unit.id} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', transition: 'all 0.18s ease', '&:hover': { borderColor: alpha(PRIMARY, 0.3), boxShadow: `0 4px 14px ${alpha('#000', 0.06)}` } }}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <GroupWorkOutlinedIcon fontSize="small" />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }} noWrap>{unit.name}</Typography>
                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25, color: unit.groupEmail ? neutral[500] : neutral[400] }}>
                                                <EmailOutlinedIcon sx={{ fontSize: 13 }} />
                                                <Typography variant="caption" sx={{ fontStyle: unit.groupEmail ? 'normal' : 'italic' }} noWrap>
                                                    {unit.groupEmail || 'No group email'}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" spacing={0.25}>
                                            <RequirePermission permission={PERMISSIONS.UPDATE_SETTING}>
                                                <Tooltip title="Edit unit" arrow>
                                                    <IconButton size="small" onClick={() => openUpdate(unit)} sx={{ color: PRIMARY }}><EditOutlinedIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </RequirePermission>
                                            <RequirePermission permission={PERMISSIONS.DELETE_SETTING}>
                                                <Tooltip title="Delete unit" arrow>
                                                    <IconButton size="small" onClick={() => { setCurrent(unit); setModal('delete'); }} sx={{ color: '#D32F2F' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </RequirePermission>
                                        </Stack>
                                    </Stack>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Chip size="small" icon={<AccountTreeOutlinedIcon sx={{ fontSize: 14 }} />}
                                        label={unit.department?.name || 'No department'}
                                        sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(PRIMARY, 0.07), color: brand[700], '& .MuiChip-icon': { color: brand[600] } }} />
                                </Paper>
                            ))}
                        </Box>
                    </Fade>
                ) : (
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: `1px dashed ${alpha(PRIMARY, 0.2)}`, bgcolor: alpha(PRIMARY, 0.015) }}>
                        <GroupWorkOutlinedIcon sx={{ fontSize: 56, color: alpha(neutral[400], 0.5), mb: 2 }} />
                        <Typography variant="h6" sx={{ color: neutral[600] }} gutterBottom>
                            {hasActiveFilters ? 'No matching units found' : 'No units yet'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: neutral[500], mb: 3, maxWidth: 440, mx: 'auto' }}>
                            {hasActiveFilters
                                ? 'Try a different search term.'
                                : 'Create units (e.g. Infrastructure, Admin) and assign them to departments so requests can be routed to their group mailbox.'}
                        </Typography>
                        {!hasActiveFilters && (
                            <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                                <Button variant="contained" onClick={openCreate} startIcon={<AddIcon />} sx={{ textTransform: 'none', borderRadius: '8px', px: 3, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' } }}>
                                    Add Unit
                                </Button>
                            </RequirePermission>
                        )}
                    </Paper>
                )}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination count={totalPages} page={pageNumber + 1} onChange={(_, v) => setPageNumber(v - 1)} color="primary" shape="rounded" />
                </Box>
            )}
        </>
    );
};

export default Units;
