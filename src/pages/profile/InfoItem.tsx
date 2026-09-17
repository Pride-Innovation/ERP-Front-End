/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import {
    Box,
    Typography,
    alpha,
    IconButton,
    Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

// Brand colors
const PRIMARY_COLOR = '#08796C';

interface InfoItemProps {
    icon: ReactNode;
    label: string;
    value: ReactNode | string;
    copyable?: boolean;
    /**
     * Shown — muted and italicised — in place of the value when there is none.
     * Lets each field explain its own absence ("Not yet modified", "Not
     * assigned") instead of falling back to a generic label.
     */
    emptyText?: string;
}

const InfoItem = ({
    icon,
    label,
    value,
    copyable = false,
    emptyText = 'Not specified'
}: InfoItemProps) => {
    const handleCopy = () => {
        if (typeof value === 'string') {
            navigator.clipboard.writeText(value);
            toast.success(`${label} copied to clipboard`);
        }
    };

    // Whitespace-only counts as empty too — composed values (e.g. a full name
    // built from missing parts) otherwise render as a blank row.
    const isEmpty = value === null || value === undefined
        || (typeof value === 'string' && value.trim() === '');

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha('#f5f5f5', 0.5),
                border: `1px solid ${alpha('#000', 0.05)}`,
                transition: 'all 0.2s',
                '&:hover': {
                    bgcolor: alpha('#f5f5f5', 0.8),
                    borderColor: alpha(PRIMARY_COLOR, 0.1),
                }
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    color: PRIMARY_COLOR,
                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    mr: 1.5,
                    flexShrink: 0
                }}
            >
                {icon}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                    }}
                >
                    {label}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        {typeof value === 'string' ? (
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: isEmpty ? 400 : 500,
                                    color: isEmpty ? 'text.disabled' : 'text.primary',
                                    fontStyle: isEmpty ? 'italic' : 'normal'
                                }}
                            >
                                {isEmpty ? emptyText : value}
                            </Typography>
                        ) : (
                            value
                        )}
                    </Box>

                    {copyable && typeof value === 'string' && !isEmpty && (
                        <Tooltip title="Copy to clipboard">
                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                sx={{
                                    color: alpha('#000', 0.5),
                                    '&:hover': {
                                        color: PRIMARY_COLOR,
                                        bgcolor: alpha(PRIMARY_COLOR, 0.1)
                                    }
                                }}
                            >
                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default InfoItem;