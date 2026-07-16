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
    FormControlLabel,
    Switch,
} from '@mui/material';
import { Control, Controller, FormState, UseFormRegister } from 'react-hook-form';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import { UseFormInput } from '../../../components/forms';
import { ICourierFormValues } from './interface';

const PRIMARY = '#08796C';

/** Bordered section card with a brand header — mirrors the Consultant form's FormSection. */
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

export interface ICourierFormProps {
    register: UseFormRegister<ICourierFormValues>;
    control: Control<ICourierFormValues>;
    formState: FormState<ICourierFormValues>;
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    isUpdate?: boolean;
}

const CourierForm = ({ register, control, formState, handleClose, sendingRequest, buttonText, isUpdate }: ICourierFormProps) => {
    const common = (value: any, label: string) => ({ register, control, formState, value, label });

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha(PRIMARY, 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <LocalShippingOutlinedIcon sx={{ color: PRIMARY }} />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B' }}>
                        {isUpdate ? 'Update Courier' : 'Register New Courier'}
                    </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {isUpdate
                        ? 'Update the courier / carrier details.'
                        : 'A vetted courier that can be selected when dispatching an inter-location movement.'}
                </Typography>
            </Box>

            <FormSection title="Courier Details" icon={<InfoIcon fontSize="small" />}>
                <Grid item xs={12} sm={6}>
                    <UseFormInput {...common('name', 'Courier / Company Name')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        control={control}
                        name="vetted"
                        render={({ field }) => (
                            <FormControlLabel
                                sx={{ mt: 1.5 }}
                                control={
                                    <Switch
                                        checked={field.value !== false}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Vetted — pre-approved for dispatch"
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Controller
                        control={control}
                        name="active"
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={field.value !== false}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Active — available for new dispatches"
                            />
                        )}
                    />
                </Grid>
            </FormSection>

            <FormSection title="Contact Information" icon={<ContactMailOutlinedIcon fontSize="small" />}>
                <Grid item xs={12} sm={6}>
                    <UseFormInput {...common('contactPerson', 'Contact Person')} required={false} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <UseFormInput {...common('phone', 'Phone Number')} required={false} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <UseFormInput {...common('email', 'Email')} type="email" required={false} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <UseFormInput {...common('address', 'Address')} required={false} />
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

export default CourierForm;
