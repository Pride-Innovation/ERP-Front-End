/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import Popover from '@mui/material/Popover';
import Grow from '@mui/material/Grow';
import { IPopover } from './interface';
import { alpha, Box, Divider, MenuItem, Typography } from '@mui/material';
import { IOptions } from '../tables/interface';

const PRIMARY = '#08796C';
const DANGER = '#DC2626';
const SLATE = '#334155';

/**
 * Destructive actions get red styling + a leading separator. Detected by an explicit
 * `danger` flag (e.g. Block / Disable Account) or a destructive label keyword.
 * Keyword matching deliberately avoids "block" so "Unblock" isn't flagged.
 */
const isDangerOption = (option?: IOptions): boolean => {
    if (!option) return false;
    if (option.danger) return true;
    const label = String(option.label ?? '').toLowerCase();
    return label.includes('reject') || label.includes('delet') || label.includes('remov') || label.includes('dispos');
};

const PopoverComponent = ({
    setAnchorEl,
    anchorEl,
    options,
    handleOptionClicked,
    moduleID,
}: IPopover) => {

    const handleClose = () => setAnchorEl(null);
    const open = Boolean(anchorEl);

    return (
        <React.Fragment>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                // Don't lock body scroll for a small dropdown — locking adds
                // scrollbar-compensation padding that shifts the fixed navbar.
                disableScrollLock
                TransitionComponent={Grow}
                transitionDuration={180}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 0.9,
                        minWidth: 218,
                        borderRadius: '14px',
                        border: '1px solid #E8EDF3',
                        boxShadow: '0 6px 12px -4px rgba(15,23,42,0.08), 0 14px 34px -6px rgba(15,23,42,0.14)',
                        overflow: 'hidden',
                        // caret
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: -5,
                            left: 18,
                            width: 10,
                            height: 10,
                            bgcolor: '#fff',
                            transform: 'rotate(45deg)',
                            border: '1px solid #E8EDF3',
                            borderBottom: 'none',
                            borderRight: 'none',
                            zIndex: 0,
                        },
                    },
                }}
            >
                <Box sx={{ p: 0.75 }}>
                    {options?.map((option: IOptions, idx: number) => {
                        const isHeader = option?.header;
                        const isLast   = idx === (options?.length ?? 0) - 1;

                        // Destructive = an explicit `danger` flag (e.g. Block / Disable) OR a
                        // destructive label keyword. Primary = the "view / details" action.
                        const label    = String(option.label ?? '').toLowerCase();
                        const isDanger = isDangerOption(option);
                        const prevIsDanger = idx > 0 ? isDangerOption(options?.[idx - 1]) : false;
                        const isView   = label.includes('view') || label.includes('detail');

                        // `accent` tints the icon tile + drives the hover; `labelColor` keeps text readable.
                        const accent     = isDanger ? DANGER : PRIMARY;
                        const labelColor = isDanger ? DANGER : (isHeader || isView) ? PRIMARY : SLATE;

                        return (
                            <React.Fragment key={idx}>
                                {/* One divider before a run of destructive actions (not at index 0) */}
                                {isDanger && idx > 0 && !prevIsDanger && (
                                    <Divider sx={{ my: 0.6, mx: 0.75, borderColor: '#EEF2F6' }} />
                                )}
                                <MenuItem
                                    onClick={() => {
                                        handleOptionClicked?.(option.value, moduleID);
                                        handleClose();
                                    }}
                                    value={option.value}
                                    sx={{
                                        borderRadius: '9px',
                                        py: 0.7,
                                        pl: 0.75,
                                        pr: 1.25,
                                        mb: isLast ? 0 : 0.25,
                                        gap: 1.1,
                                        bgcolor: isView ? alpha(PRIMARY, 0.05) : isHeader ? alpha(PRIMARY, 0.04) : 'transparent',
                                        transition: 'background-color 0.14s ease, transform 0.14s ease',
                                        '&:hover': {
                                            bgcolor: alpha(accent, isDanger ? 0.07 : 0.08),
                                            transform: 'translateX(2px)',
                                        },
                                    }}
                                >
                                    {option?.icon && (
                                        <Box
                                            sx={{
                                                width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                bgcolor: alpha(accent, 0.1),
                                                '& .MuiSvgIcon-root': { fontSize: 16, color: accent },
                                            }}
                                        >
                                            {option.icon}
                                        </Box>
                                    )}
                                    <Typography sx={{
                                        fontSize: '0.82rem',
                                        fontWeight: (isHeader || isView) ? 700 : 600,
                                        color: labelColor,
                                        lineHeight: 1.3,
                                    }}>
                                        {option.label}
                                    </Typography>
                                </MenuItem>
                                {/* Explicit separator after this option (e.g. to set the primary view action apart) */}
                                {option.divider && !isLast && (
                                    <Divider sx={{ my: 0.6, mx: 0.75, borderColor: '#EEF2F6' }} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Popover>
        </React.Fragment>
    );
};

export default PopoverComponent;
