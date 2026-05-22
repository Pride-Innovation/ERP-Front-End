/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography, alpha } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { brand, neutral } from '../../utils/tokens';

export interface IPageSectionProps {
    /** Section title (left of the divider). */
    title: string;
    /** One-line description under the title. */
    subtitle?: string;
    /** Optional icon shown inside a soft-brand badge to the left of the title. */
    icon?: ReactNode;
    /** Tooltip body rendered behind a help icon on the right edge of the header. */
    helpText?: string;
    /** Right-side slot — buttons, switches, etc. */
    actions?: ReactNode;
    /** Use `flat` for the bordered/paddingless variant intended for use inside a card. */
    variant?: 'default' | 'flat';
    /** Section content. */
    children: ReactNode;
    /** Optional bottom margin override. */
    mb?: number;
}

/**
 * Section header for use within a page (below `<PageShell>`).
 *
 * Replaces the bespoke `FormSection` blocks scattered across the codebase
 * (e.g. RequestForm, AssetTypeForm). Two visual variants:
 *
 * - `default` (the standard): bold left bar + icon badge + title row.
 *   Use inside a page body.
 * - `flat`: same structure, no left bar — for nesting inside a Paper that
 *   already has its own border.
 */
const PageSection = ({
    title,
    subtitle,
    icon,
    helpText,
    actions,
    variant = 'default',
    children,
    mb = 4,
}: IPageSectionProps) => (
    <Box sx={{ mb }}>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: subtitle ? 0.5 : 2,
                pb: variant === 'default' ? 1.5 : 0,
                borderBottom:
                    variant === 'default' ? `1px solid ${alpha('#000', 0.07)}` : undefined,
            }}
        >
            {variant === 'default' && (
                <Box
                    sx={{
                        width: 3,
                        height: 20,
                        bgcolor: brand[500],
                        borderRadius: '2px',
                        flexShrink: 0,
                    }}
                />
            )}
            {icon && (
                <Box
                    sx={{
                        color: brand[500],
                        bgcolor: alpha(brand[500], 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        flexShrink: 0,
                        '& .MuiSvgIcon-root': { fontSize: 18 },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: neutral[900] }}>
                    {title}
                </Typography>
            </Stack>
            {helpText && (
                <Tooltip title={helpText} arrow placement="top">
                    <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" sx={{ color: neutral[400] }} />
                    </IconButton>
                </Tooltip>
            )}
            {actions && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        flexShrink: 0,
                        alignItems: 'center',
                    }}
                >
                    {actions}
                </Box>
            )}
        </Box>
        {subtitle && (
            <Typography variant="body2" sx={{ mb: 2, mt: 0.5, color: neutral[500] }}>
                {subtitle}
            </Typography>
        )}
        {children}
    </Box>
);

export default PageSection;
