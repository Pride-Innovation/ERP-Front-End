/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    Stack,
    Typography,
    alpha,
    Paper,
    Button as MuiButton,
    CircularProgress,
} from '@mui/material';
import { Control, FormState, UseFormRegister } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { UseFormInput, UseFormAutocompleteComponent } from '../../../components/forms';
import DepartmentUtills from '../departments/utills';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import InfoIcon from '@mui/icons-material/Info';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

const PRIMARY = '#08796C';

/** Bordered section card with a brand header — mirrors the Department form's FormSection. */
const FormSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(PRIMARY, 0.15)}` }}>
        <Box sx={{ p: 2, bgcolor: alpha(PRIMARY, 0.04), borderBottom: `1px solid ${alpha(PRIMARY, 0.1)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '7px', background: `linear-gradient(135deg, ${PRIMARY}, #065E53)`, display: 'flex', alignItems: 'center', justifyContent: 'center', '& .MuiSvgIcon-root': { color: '#fff', fontSize: '15px' } }}>
                {icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY }}>{title}</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>{children}</Grid>
        </Box>
    </Paper>
);

export interface IUnitFormProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    formState: FormState<any>;
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    isUpdate?: boolean;
}

const UnitForm = ({ register, control, formState, handleClose, sendingRequest, buttonText, isUpdate }: IUnitFormProps) => {
    const { fetchAllDepartments } = DepartmentUtills();
    const { departments } = useSelector((state: RootState) => state.DepartmentStore);

    useEffect(() => {
        if (!departments || departments.length === 0) {
            fetchAllDepartments({ pageSize: 100 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const departmentOptions = useMemo(
        () => (departments ?? []).map((d) => ({ label: d.name, value: d.id as number })),
        [departments],
    );

    const common = (value: string, label: string) => ({ register, control, formState, value, label });

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha(PRIMARY, 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <GroupWorkOutlinedIcon sx={{ color: PRIMARY }} />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B' }}>
                        {isUpdate ? 'Update Unit' : 'Create New Unit'}
                    </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {isUpdate
                        ? 'Update the unit details and its parent department.'
                        : 'A unit owns a group mailbox; its members act on requests routed to that unit.'}
                </Typography>
            </Box>

            <FormSection title="Unit Details" icon={<InfoIcon fontSize="small" />}>
                <Grid item xs={12}>
                    <UseFormInput {...common('name', 'Unit Name')} />
                </Grid>
                <Grid item xs={12}>
                    <UseFormInput {...common('groupEmail', 'Group Email')} type="email" />
                </Grid>
            </FormSection>

            <FormSection title="Department" icon={<AccountTreeOutlinedIcon fontSize="small" />}>
                <Grid item xs={12}>
                    <UseFormAutocompleteComponent {...common('departmentId', 'Department')} options={departmentOptions} />
                </Grid>
            </FormSection>

            {/* Actions */}
            <Box sx={{ pt: 2, mt: 1, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
                <Stack direction="row" spacing={2}>
                    <MuiButton
                        onClick={handleClose}
                        type="button"
                        variant="outlined"
                        disabled={sendingRequest}
                        sx={{ minWidth: 100, borderRadius: '8px', textTransform: 'none', py: 0.85, borderColor: alpha('#000', 0.2), color: 'text.secondary', '&:hover': { borderColor: alpha('#000', 0.3) } }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        type="submit"
                        variant="contained"
                        disabled={sendingRequest}
                        sx={{ minWidth: 100, borderRadius: '8px', textTransform: 'none', py: 0.85, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}
                    >
                        {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default UnitForm;
