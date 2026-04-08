/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, Box, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { UseFormInput, UseFormSelect, UseFormDatePicker, UseFormAutocompleteComponent } from '../../components/forms';
import { IMovementForm } from './interface';
import { ROUTES } from '../../core/routes/routes';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ButtonComponent from '../../components/forms/Button';
import { IOptions } from '../../components/tables/interface';

const PRIMARY = '#08796C';

const destinationTypeOptions: IOptions[] = [
    { value: 'Branch', label: 'Branch' },
    { value: 'Department', label: 'Department' },
    { value: 'External', label: 'External' },
];

interface SectionProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    helpText?: string;
}

const FormSection = ({ title, subtitle, icon, children, helpText }: SectionProps) => (
    <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: subtitle ? 0.5 : 2, pb: 1.5, borderBottom: `2px solid ${alpha(PRIMARY, 0.1)}` }}>
            {icon && (
                <Box sx={{ mr: 1.5, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', flexShrink: 0 }}>
                    {icon}
                </Box>
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', flexGrow: 1 }}>
                {title}
            </Typography>
            {helpText && (
                <Tooltip title={helpText} arrow placement="top">
                    <IconButton size="small"><HelpOutlineIcon fontSize="small" color="action" /></IconButton>
                </Tooltip>
            )}
        </Box>
        {subtitle && <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>{subtitle}</Typography>}
        {children}
    </Box>
);

const MovementForm = ({
    register,
    control,
    formState,
    sendingRequest,
    buttonText,
}: IMovementForm) => {
    const navigate = useNavigate();

    return (
        <Stack spacing={3}>
            {/* Officer + Destination */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Requesting Officer & Destination"
                    subtitle="Select the officer initiating this movement and the destination."
                    icon={<SwapHorizOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={6}>
                            <UseFormAutocompleteComponent
                                register={register}
                                control={control}
                                formState={formState}
                                value="officerId"
                                label="Requesting Officer"
                                options={[]}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <UseFormSelect
                                register={register}
                                control={control}
                                formState={formState}
                                value="destinationType"
                                label="Destination Type"
                                options={destinationTypeOptions}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="destination"
                                label="Destination (Branch / Department / Location)"
                            />
                        </Grid>
                    </Grid>
                </FormSection>
            </Paper>

            {/* Movement details */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Movement Details"
                    subtitle="Describe the purpose of this movement."
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="reason"
                                label="Reason for Movement"
                                multiline
                                row={3}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <UseFormDatePicker
                                register={register}
                                control={control}
                                formState={formState}
                                value="expectedReturnDate"
                                label="Expected Return Date"
                                required={false}
                            />
                        </Grid>
                    </Grid>
                </FormSection>
            </Paper>

            {/* Actions */}
            <Paper elevation={0} sx={{ px: 3, py: 2.5, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 130 }}>
                    <ButtonComponent
                        sendingRequest={false}
                        buttonText="Cancel"
                        buttonColor="inherit"
                        variant="outlined"
                        type="button"
                        handleClick={() => navigate(ROUTES.MOVEMENT)}
                    />
                </Box>
                <Box sx={{ width: 190 }}>
                    <ButtonComponent
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                        buttonColor="primary"
                        variant="contained"
                        type="submit"
                    />
                </Box>
            </Paper>
        </Stack>
    );
};

export default MovementForm;
