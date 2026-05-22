/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, Paper, Stack, Typography, alpha } from '@mui/material';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import { brand, gold, neutral } from '../../utils/tokens';

export interface IEmptyStateProps {
    /** Headline shown below the icon, e.g. "No workflows configured yet". */
    title: string;
    /** One-sentence body explaining what to do next. */
    description?: string;
    /** Override the default folder-off icon. */
    icon?: ReactNode;
    /** Primary call-to-action (typically a `<Button>` to create the first item). */
    action?: ReactNode;
    /**
     * Variant:
     * - `card` — boxed inside a bordered Paper. Use when this is the only content of a section.
     * - `inline` — no surface; use when nested inside a Paper or Card.
     */
    variant?: 'card' | 'inline';
    /** Accent — defaults to gold (less attention-grabbing) but `brand` is available for primary flows. */
    accent?: 'brand' | 'gold';
}

const EmptyState = ({
    title,
    description,
    icon,
    action,
    variant = 'card',
    accent = 'gold',
}: IEmptyStateProps) => {
    const accentColor = accent === 'gold' ? gold[500] : brand[500];

    const body = (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            sx={{ py: variant === 'card' ? 6 : 5, px: 4, textAlign: 'center' }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: alpha(accentColor, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    color: accentColor,
                    '& .MuiSvgIcon-root': { fontSize: 36, color: accentColor },
                }}
            >
                {icon ?? <FolderOffOutlinedIcon />}
            </Box>
            <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: neutral[900] }}
            >
                {title}
            </Typography>
            {description && (
                <Typography
                    variant="body2"
                    sx={{ color: neutral[500], maxWidth: 360, lineHeight: 1.6 }}
                >
                    {description}
                </Typography>
            )}
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </Stack>
    );

    if (variant === 'inline') return body;

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 3,
                borderColor: alpha(accentColor, 0.18),
            }}
        >
            {body}
        </Paper>
    );
};

export default EmptyState;
