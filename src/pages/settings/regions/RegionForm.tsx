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
    useTheme,
    Paper,
    Button as MuiButton,
    CircularProgress
} from '@mui/material';
import { UseFormInput } from '../../../components/forms';
import { IRegionForm } from './interface';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import InfoIcon from '@mui/icons-material/Info';

const RegionForm = ({
    register,
    control,
    formState,
    handleClose,
    sendingRequest,
    buttonText
}: IRegionForm) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%' }}>
            {/* Form Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha('#08796C', 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <PublicOutlinedIcon sx={{ color: '#08796C' }} />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B' }}>
                        {buttonText === 'Submit' ? 'Create New Region' : 'Update Region'}
                    </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {buttonText === 'Submit'
                        ? 'Add a new geographical region to organize your branches'
                        : 'Update region information'
                    }
                </Typography>
            </Box>

            {/* Form Content */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${alpha('#08796C', 0.15)}`
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        bgcolor: alpha('#08796C', 0.04),
                        borderBottom: `1px solid ${alpha('#08796C', 0.1)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}
                >
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '7px',
                            background: 'linear-gradient(135deg, #08796C, #065E53)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '& .MuiSvgIcon-root': { color: '#fff', fontSize: '15px' }
                        }}
                    >
                        <InfoIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#08796C' }}>
                        Region Information
                    </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="name"
                                label="Region Name"
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Form Actions */}
            <Box
                sx={{
                    pt: 2,
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        type="button"
                        variant="outlined"
                        disabled={sendingRequest}
                        sx={{
                            minWidth: '110px',
                            borderRadius: '8px',
                            py: 0.85,
                            textTransform: 'none',
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            '&:hover': { borderColor: alpha('#000', 0.3) },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        color="primary"
                        type="submit"
                        variant="contained"
                        disabled={sendingRequest}
                        sx={{
                            minWidth: '110px',
                            borderRadius: '8px',
                            py: 0.85,
                            textTransform: 'none',
                            bgcolor: '#08796C',
                            '&:hover': { bgcolor: '#065E53' },
                            boxShadow: '0 2px 8px rgba(8,121,108,0.3)',
                        }}
                    >
                        {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default RegionForm;