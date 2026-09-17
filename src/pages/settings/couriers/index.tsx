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
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { toast } from 'react-toastify';

import { PageHero } from '../../../components/layout';
import ModalComponent from '../../../components/modal';
import Loading from '../../../components/loading';
import { RequirePermission } from '../../../core/permissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
import { brand, neutral, border } from '../../../utils/tokens';
import { ICourier, ICourierFormValues, ICouriersAxiosResponse } from './interface';
import { courierSchema } from './schema';
import CourierForm from './CourierForm';
import {
    fetchCouriersService,
    createCourierService,
    updateCourierService,
    deleteCourierService,
} from './service';

const PRIMARY = brand[500];
const PAGE_SIZE = 9;

const Couriers = () => {
    const [couriers, setCouriers] = useState<ICourier[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState<'create' | 'update' | 'delete' | ''>('');
    const [current, setCurrent] = useState<ICourier | null>(null);

    const { control, handleSubmit, formState, register, reset } = useForm<ICourierFormValues>({
        mode: 'onChange',
        resolver: yupResolver(courierSchema) as any,
        defaultValues: { name: '', contactPerson: '', phone: '', email: '', address: '', vetted: true, active: true },
    });

    const fetchCouriers = async () => {
        setLoading(true);
        try {
            const res = (await fetchCouriersService(false)) as ICouriersAxiosResponse;
            if (res?.status === 200) {
                setCouriers(res.data ?? []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCouriers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The couriers endpoint is a plain list, so search + pagination happen client-side.
    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return couriers;
        return couriers.filter((c) =>
            [c.name, c.contactPerson, c.email, c.phone]
                .some((f) => f?.toLowerCase().includes(q)));
    }, [couriers, searchTerm]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE);

    const hasActiveFilters = searchTerm !== '';
    const closeModal = () => { setModal(''); setCurrent(null); };

    const openCreate = () => {
        reset({ name: '', contactPerson: '', phone: '', email: '', address: '', vetted: true, active: true });
        setModal('create');
    };

    const openUpdate = (courier: ICourier) => {
        setCurrent(courier);
        reset({
            name: courier.name,
            contactPerson: courier.contactPerson ?? '',
            phone: courier.phone ?? '',
            email: courier.email ?? '',
            address: courier.address ?? '',
            vetted: courier.vetted !== false,
            active: courier.active !== false,
        });
        setModal('update');
    };

    const onSubmit = async (data: ICourierFormValues) => {
        setSending(true);
        const body = {
            name: data.name.trim(),
            contactPerson: data.contactPerson?.trim() || null,
            phone: data.phone?.trim() || null,
            email: data.email?.trim() || null,
            address: data.address?.trim() || null,
            vetted: data.vetted !== false,
            active: data.active !== false,
        };
        const res = current
            ? await updateCourierService(body, current.id as number)
            : await createCourierService(body);
        setSending(false);
        const status = (res as { status?: number })?.status;
        if (status === 200 || status === 201) {
            toast.success(current ? 'Courier updated.' : 'Courier registered.');
            closeModal();
            fetchCouriers();
        }
        // errors are surfaced by the axios interceptor toast
    };

    const handleDelete = async () => {
        if (!current?.id) return;
        setSending(true);
        const res = await deleteCourierService(current.id);
        setSending(false);
        const status = (res as { status?: number })?.status;
        if (status === 200 || status === 201) {
            toast.success('Courier deleted.');
            closeModal();
            fetchCouriers();
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
                <ModalComponent width="55%" title={modal === 'create' ? 'Register Courier' : 'Update Courier'} open handleClose={closeModal}>
                    <form style={{ width: '100%' }} autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <CourierForm
                            register={register}
                            control={control}
                            formState={formState}
                            handleClose={closeModal}
                            sendingRequest={sending}
                            buttonText={modal === 'create' ? 'Register Courier' : 'Update Courier'}
                            isUpdate={modal === 'update'}
                        />
                    </form>
                </ModalComponent>
            )}

            {/* Delete modal */}
            {modal === 'delete' && (
                <ModalComponent width="40%" title="Delete Courier" open handleClose={closeModal}>
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
                                    This removes the courier. Consider marking it inactive instead
                                    if past movements reference it.
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                            <Button onClick={closeModal} disabled={sending} sx={{ textTransform: 'none', borderRadius: '8px', color: neutral[600] }}>Cancel</Button>
                            <Button onClick={handleDelete} disabled={sending} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: '8px' }}>
                                {sending ? 'Deleting…' : 'Delete Courier'}
                            </Button>
                        </Stack>
                    </Box>
                </ModalComponent>
            )}

            <PageHero
                title="Couriers"
                subtitle="Vetted carriers that can be selected when dispatching an inter-location movement"
                icon={<LocalShippingOutlinedIcon />}
                stat={{ value: couriers.length ?? 0, label: 'records', helper: todayLabel }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                        <Button onClick={openCreate} startIcon={<AddIcon />} variant="contained"
                            sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
                            Add Courier
                        </Button>
                    </RequirePermission>
                }
            />

            {/* Filter bar */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search couriers..."
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
                        <Loading items="couriers" />
                    </Paper>
                ) : paginated.length > 0 ? (
                    <Fade in={!loading}>
                        <Box className="settings-card-grid">
                            {paginated.map((courier) => (
                                <Paper key={courier.id} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', transition: 'all 0.18s ease', '&:hover': { borderColor: alpha(PRIMARY, 0.3), boxShadow: `0 4px 14px ${alpha('#000', 0.06)}` } }}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <LocalShippingOutlinedIcon fontSize="small" />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }} noWrap>{courier.name}</Typography>
                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25, color: courier.email ? neutral[500] : neutral[400] }}>
                                                <EmailOutlinedIcon sx={{ fontSize: 13 }} />
                                                <Typography variant="caption" sx={{ fontStyle: courier.email ? 'normal' : 'italic' }} noWrap>
                                                    {courier.email || 'No email'}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" spacing={0.25}>
                                            <RequirePermission permission={PERMISSIONS.UPDATE_SETTING}>
                                                <Tooltip title="Edit courier" arrow>
                                                    <IconButton size="small" onClick={() => openUpdate(courier)} sx={{ color: PRIMARY }}><EditOutlinedIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </RequirePermission>
                                            <RequirePermission permission={PERMISSIONS.DELETE_SETTING}>
                                                <Tooltip title="Delete courier" arrow>
                                                    <IconButton size="small" onClick={() => { setCurrent(courier); setModal('delete'); }} sx={{ color: '#D32F2F' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </RequirePermission>
                                        </Stack>
                                    </Stack>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                        <Chip size="small"
                                            label={courier.active !== false ? 'Active' : 'Inactive'}
                                            sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem',
                                                bgcolor: courier.active !== false ? alpha('#15803D', 0.08) : alpha('#B91C1C', 0.08),
                                                color: courier.active !== false ? '#15803D' : '#B91C1C' }} />
                                        {courier.vetted !== false ? (
                                            <Chip size="small" icon={<VerifiedOutlinedIcon sx={{ fontSize: 14 }} />} label="Vetted"
                                                sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(PRIMARY, 0.07), color: brand[700] }} />
                                        ) : (
                                            <Chip size="small" label="Ad-hoc"
                                                sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha('#B45309', 0.08), color: '#B45309' }} />
                                        )}
                                        {courier.contactPerson && (
                                            <Chip size="small" icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 14 }} />} label={courier.contactPerson}
                                                sx={{ height: 24, fontWeight: 500, fontSize: '0.72rem', bgcolor: alpha('#64748B', 0.07), color: neutral[600] }} />
                                        )}
                                        {courier.phone && (
                                            <Chip size="small" icon={<LocalPhoneOutlinedIcon sx={{ fontSize: 14 }} />} label={courier.phone}
                                                sx={{ height: 24, fontWeight: 500, fontSize: '0.72rem', bgcolor: alpha('#64748B', 0.07), color: neutral[600] }} />
                                        )}
                                    </Stack>
                                </Paper>
                            ))}
                        </Box>
                    </Fade>
                ) : (
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: `1px dashed ${alpha(PRIMARY, 0.2)}`, bgcolor: alpha(PRIMARY, 0.015) }}>
                        <LocalShippingOutlinedIcon sx={{ fontSize: 56, color: alpha(neutral[400], 0.5), mb: 2 }} />
                        <Typography variant="h6" sx={{ color: neutral[600] }} gutterBottom>
                            {hasActiveFilters ? 'No matching couriers found' : 'No couriers yet'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: neutral[500], mb: 3, maxWidth: 440, mx: 'auto' }}>
                            {hasActiveFilters
                                ? 'Try a different search term.'
                                : 'Register vetted couriers so they can be selected when dispatching an inter-location movement. Ad-hoc couriers are still tracked automatically the first time they’re used.'}
                        </Typography>
                        {!hasActiveFilters && (
                            <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                                <Button variant="contained" onClick={openCreate} startIcon={<AddIcon />} sx={{ textTransform: 'none', borderRadius: '8px', px: 3, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' } }}>
                                    Add Courier
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

export default Couriers;
