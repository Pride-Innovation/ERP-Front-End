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
    Button as MuiButton,
    CircularProgress,
    Grid,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { useTheme } from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
    UseFormAutocompleteComponent,
    UseFormInput,
} from '../../../components/forms';
import TitleUtills from './utills';
import RoleUtills from '../roles/utills';
import { ITitle, ITitleForm, ITitleOption } from './interface';
import { fetchRowsService } from '../../../core/apis/globalService';
import { useDebounce } from '../../../hooks/useDebounce';
import { autocompleteSx } from '../../../components/forms/Autocomplete';

const P = '#08796C';

/* ── live-search "Reports To" picker ──────────────────────────────── */

const CustomPopper = (props: any) => (
    <Popper
        {...props}
        placement="bottom-start"
        style={{ ...props.style, zIndex: 1500 }}
        modifiers={[
            { name: 'preventOverflow', options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
            { name: 'flip', options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
        ]}
    />
);

interface ReportsToPickerProps {
    control: Control<ITitle>;
    initialOption?: ITitleOption | null;
}

const ReportsToPicker = ({ control, initialOption }: ReportsToPickerProps) => {
    const [options, setOptions] = useState<ITitleOption[]>(initialOption ? [initialOption] : []);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const debouncedInput = useDebounce(inputValue, 400);

    useEffect(() => {
        let active = true;
        setLoading(true);

        fetchRowsService({
            pageNumber: 0,
            pageSize: 10,
            endPoint: 'titles',
            params: debouncedInput.trim() ? { name: debouncedInput.trim() } : {},
        } as any)
            .then((res: any) => {
                if (!active) return;
                const items: ITitle[] = res?.data?.content ?? [];
                const mapped: ITitleOption[] = items.map((t) => ({
                    value: t.id as number,
                    label: t.name,
                }));
                // always keep the current "reports to" in the list so the display doesn't break
                if (initialOption && !mapped.find((m) => m.value === initialOption.value)) {
                    mapped.unshift(initialOption);
                }
                setOptions(mapped);
            })
            .catch(() => {})
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [debouncedInput]);

    return (
        <Controller
            control={control}
            name="reportsTo"
            render={({ field, fieldState }) => {
                // Resolve the currently selected option from the options list.
                // This is a plain expression (not a hook) so it's safe inside a render prop.
                const fieldNum = Number(field.value);
                const selectedOption: ITitleOption | null =
                    options.find((o) => Number(o.value) === fieldNum) ??
                    (initialOption && fieldNum === Number(initialOption.value) ? initialOption : null);

                return (
                    <Autocomplete
                        fullWidth
                        options={options}
                        value={selectedOption}
                        loading={loading}
                        filterOptions={(x) => x}
                        getOptionLabel={(opt) => opt.label}
                        isOptionEqualToValue={(opt, val) => opt.value === val.value}
                        PopperComponent={CustomPopper}
                        onInputChange={(_, val, reason) => {
                            if (reason === 'input') setInputValue(val);
                        }}
                        onChange={(_, newVal) => {
                            (field.onChange as any)(newVal?.value ?? null);
                        }}
                        PaperComponent={({ children, ...props }) => (
                            <Paper
                                {...props}
                                elevation={4}
                                sx={{
                                    mt: 0.5,
                                    borderRadius: '8px',
                                    boxShadow: `0 4px 24px ${alpha('#000', 0.12)}`,
                                    '& .MuiAutocomplete-listbox': {
                                        padding: '4px 0',
                                        '& .MuiAutocomplete-option': {
                                            fontSize: '0.875rem',
                                            minHeight: 40,
                                            px: 2,
                                            '&:hover': { backgroundColor: alpha(P, 0.06) },
                                            '&[aria-selected="true"]': {
                                                backgroundColor: alpha(P, 0.1),
                                                color: P,
                                                fontWeight: 500,
                                            },
                                        },
                                    },
                                }}
                            >
                                {children}
                            </Paper>
                        )}
                        noOptionsText={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                <SearchOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                                    {loading ? 'Searching…' : 'No titles found — try a different name'}
                                </Typography>
                            </Box>
                        }
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.value}>
                                <Typography sx={{ fontSize: '0.875rem' }}>{option.label}</Typography>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Reports To"
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                                sx={autocompleteSx}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading && (
                                                <CircularProgress
                                                    size={14}
                                                    sx={{ color: P, mr: 0.5 }}
                                                />
                                            )}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                );
            }}
        />
    );
};

/* ── form section wrapper ─────────────────────────────────────────── */

const FormSection = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) => (
    <Paper
        elevation={0}
        sx={{
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${alpha(P, 0.15)}`,
        }}
    >
        <Box sx={{
            p: 2,
            bgcolor: alpha(P, 0.04),
            borderBottom: `1px solid ${alpha(P, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
        }}>
            <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '7px',
                bgcolor: alpha(P, 0.12),
                border: `1px solid ${alpha(P, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& .MuiSvgIcon-root': { color: P, fontSize: '16px' },
            }}>
                {icon}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: P }}>
                {title}
            </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {children}
            </Grid>
        </Box>
    </Paper>
);

/* ── main TitleForm ───────────────────────────────────────────────── */

const TitleForm = ({
    register,
    control,
    formState,
    handleClose,
    buttonText,
    sendingRequest,
    update,
    initialReportsTo,
}: ITitleForm) => {
    const { formFields } = TitleUtills();
    const { fetchAllRoles } = RoleUtills();
    const theme = useTheme();

    useEffect(() => {
        fetchAllRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const basicFields  = formFields.filter((f) => f.value === 'name');
    const roleFields   = formFields.filter((f) => f.value === 'role');

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha(P, 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
                    <WorkOutlineOutlinedIcon sx={{ color: P }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
                        {update ? 'Update Title' : 'Create New Title'}
                    </Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                    {update
                        ? 'Update the title details and organisational structure'
                        : 'Define a new organisational title and its reporting hierarchy'}
                </Typography>
            </Box>

            {/* Basic Information */}
            <FormSection title="Basic Information" icon={<InfoIcon fontSize="small" />}>
                {basicFields.map((field) => (
                    <Grid item xs={12} key={field.value}>
                        <UseFormInput
                            register={register}
                            control={control}
                            formState={formState}
                            value={field.value}
                            label={field.label}
                        />
                    </Grid>
                ))}
            </FormSection>

            {/* Reporting Structure — live-search autocomplete */}
            <FormSection title="Reporting Structure" icon={<SupervisorAccountIcon fontSize="small" />}>
                <Grid item xs={12}>
                    <ReportsToPicker control={control} initialOption={initialReportsTo} />
                    <Typography sx={{ mt: 0.75, fontSize: '0.72rem', color: '#94A3B8' }}>
                        Type to search titles by name. The first 10 matching results will appear.
                    </Typography>
                </Grid>
            </FormSection>

            {/* Role Assignment */}
            <FormSection title="Role Assignment" icon={<SecurityIcon fontSize="small" />}>
                {roleFields.map((field) => (
                    <Grid item xs={12} key={field.value}>
                        <UseFormAutocompleteComponent
                            register={register}
                            control={control}
                            formState={formState}
                            value={field.value}
                            label={field.label}
                            options={field.options || []}
                        />
                    </Grid>
                ))}
            </FormSection>

            {/* Actions */}
            <Box sx={{
                pt: 2,
                mt: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
                <Stack direction="row" spacing={1.5}>
                    <MuiButton
                        onClick={handleClose}
                        type="button"
                        variant="outlined"
                        sx={{
                            minWidth: 110,
                            height: 38,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: '#E2E8F0',
                            color: '#64748B',
                            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        type="submit"
                        variant="contained"
                        sx={{
                            minWidth: 130,
                            height: 38,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: P,
                            boxShadow: `0 2px 8px ${alpha(P, 0.3)}`,
                            '&:hover': { bgcolor: '#065E53' },
                            '&.Mui-disabled': { bgcolor: alpha(P, 0.45), color: '#fff' },
                        }}
                    >
                        {sendingRequest
                            ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                            : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default TitleForm;
