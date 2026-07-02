/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Stack,
    Typography,
    alpha,
    Paper,
    Button as MuiButton,
    CircularProgress,
    Divider,
} from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import TagIcon from '@mui/icons-material/Tag';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import { UseFormInput } from '../../../components/forms';
import { IAssetTypeForm } from './interface';

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
            border: `1px solid ${alpha('#08796C', 0.15)}`,
        }}
    >
        <Box
            sx={{
                p: 2,
                bgcolor: alpha('#08796C', 0.04),
                borderBottom: `1px solid ${alpha('#08796C', 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
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
                    '& .MuiSvgIcon-root': { color: '#fff', fontSize: '15px' },
                }}
            >
                {icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#08796C' }}>
                {title}
            </Typography>
        </Box>
        <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
);

const AssetTypeForm = ({
    register,
    control,
    formState,
    handleClose,
    sendingRequest,
    buttonText,
}: IAssetTypeForm) => {

    return (
        <Box>
            <FormSection title="Category Details" icon={<CategoryOutlinedIcon />}>
                <Stack spacing={2.5}>
                    <UseFormInput
                        label="Category Name *"
                        register={register}
                        control={control}
                        formState={formState}
                        value="name"
                    />
                    <UseFormInput
                        label="Short Code"
                        register={register}
                        control={control}
                        formState={formState}
                        value="shortCode"
                    />
                </Stack>
            </FormSection>

            <FormSection title="Fulfilment Group" icon={<GroupsOutlinedIcon />}>
                <UseFormInput
                    label="Owner Group Email"
                    register={register}
                    control={control}
                    formState={formState}
                    value="ownerGroupEmail"
                    required={false}
                />
                <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: alpha('#08796C', 0.04), border: `1px solid ${alpha('#08796C', 0.1)}` }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TagIcon sx={{ fontSize: 16, color: '#08796C', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" lineHeight={1.6}>
                            Email group notified to fulfil a request after all approvals (e.g. <em>it-infra@…</em> for Computer,
                            <em> admin@…</em> for Furniture). Leave empty if fulfilment routing is set per-workflow instead.
                        </Typography>
                    </Stack>
                </Box>
            </FormSection>

            <FormSection title="Depreciation" icon={<TrendingDownOutlinedIcon />}>
                <Stack spacing={2.5}>
                    <UseFormInput
                        label="Annual Depreciation Rate (%)"
                        register={register}
                        control={control}
                        formState={formState}
                        value="depreciationRate"
                        type="number"
                        required={false}
                    />
                    <UseFormInput
                        label="Useful Life (months)"
                        register={register}
                        control={control}
                        formState={formState}
                        value="usefulLifeMonths"
                        type="number"
                        required={false}
                    />
                </Stack>
                <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: alpha('#08796C', 0.04), border: `1px solid ${alpha('#08796C', 0.1)}` }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TagIcon sx={{ fontSize: 16, color: '#08796C', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" lineHeight={1.6}>
                            Reducing-balance method: each year's charge is <em>opening NBV × rate</em>, so it
                            shrinks over time. On an asset, the Net Value, Net Book Value, Accumulated / Annual /
                            Monthly Depreciation are all derived from the rate and shown read-only. Useful Life is
                            the number of months an asset is kept before it is flagged ready for disposal.
                        </Typography>
                    </Stack>
                </Box>
            </FormSection>

            <FormSection title="Additional Information" icon={<InfoOutlinedIcon />}>
                <UseFormInput
                    label="Description"
                    register={register}
                    control={control}
                    formState={formState}
                    value="description"
                    multiline
                    row={3}
                />
                <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: alpha('#08796C', 0.04), border: `1px solid ${alpha('#08796C', 0.1)}` }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TagIcon sx={{ fontSize: 16, color: '#08796C', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" lineHeight={1.6}>
                            The short code is used as a unique identifier prefix for assets in this category (e.g., "C" for Computers).
                            It will be stored in uppercase and must be unique across all categories.
                        </Typography>
                    </Stack>
                </Box>
            </FormSection>

            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                <MuiButton
                    onClick={handleClose}
                    type="button"
                    variant="outlined"
                    color="inherit"
                    sx={{
                        borderRadius: '8px',
                        borderColor: alpha('#000', 0.2),
                        color: 'text.secondary',
                        '&:hover': { borderColor: alpha('#000', 0.3) },
                    }}
                >
                    Cancel
                </MuiButton>
                <MuiButton
                    type="submit"
                    variant="contained"
                    disabled={sendingRequest}
                    sx={{
                        px: 4,
                        borderRadius: '8px',
                        bgcolor: '#08796C',
                        boxShadow: `0 2px 8px ${alpha('#08796C', 0.3)}`,
                        '&:hover': { bgcolor: '#065E53' },
                    }}
                >
                    {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                </MuiButton>
            </Stack>
        </Box>
    );
};

export default AssetTypeForm;
