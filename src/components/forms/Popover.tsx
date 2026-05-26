/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import Popover from '@mui/material/Popover';
import { IPopover } from './interface';
import { alpha, Box, Divider, ListItemIcon, MenuItem, Typography } from '@mui/material';
import { IOptions } from '../tables/interface';

const PRIMARY = '#08796C';

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
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 0.75,
                        minWidth: 196,
                        borderRadius: '10px',
                        border: '1px solid #E8EDF3',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 28px -4px rgba(0,0,0,0.1)',
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
                <Box sx={{ p: 0.5 }}>
                    {options?.map((option: IOptions, idx: number) => {
                        const isHeader = option?.header;
                        const isLast   = idx === (options?.length ?? 0) - 1;

                        // Detect destructive action by label keywords
                        const label    = String(option.label ?? '').toLowerCase();
                        const isDanger = label.includes('reject') || label.includes('delet') || label.includes('remov') || label.includes('dispos');

                        const itemColor  = isDanger ? '#DC2626' : isHeader ? PRIMARY : '#334155';
                        const hoverBg    = isDanger ? alpha('#DC2626', 0.05) : isHeader ? alpha(PRIMARY, 0.07) : alpha(PRIMARY, 0.04);

                        return (
                            <React.Fragment key={idx}>
                                {/* Divider before destructive actions (not at index 0) */}
                                {isDanger && idx > 0 && (
                                    <Divider sx={{ my: 0.5, mx: 1, borderColor: '#F1F5F9' }} />
                                )}
                                <MenuItem
                                    onClick={() => {
                                        handleOptionClicked?.(option.value, moduleID);
                                        handleClose();
                                    }}
                                    value={option.value}
                                    sx={{
                                        borderRadius: '7px',
                                        py: 0.9,
                                        px: 1.25,
                                        mb: isLast ? 0 : 0.15,
                                        gap: 1,
                                        bgcolor: isHeader ? alpha(PRIMARY, 0.04) : 'transparent',
                                        transition: 'background-color 0.1s',
                                        '&:hover': { bgcolor: hoverBg },
                                    }}
                                >
                                    {option?.icon && (
                                        <ListItemIcon sx={{
                                            minWidth: 26,
                                            '& .MuiSvgIcon-root': {
                                                fontSize: 16,
                                                color: itemColor,
                                            },
                                        }}>
                                            {option.icon}
                                        </ListItemIcon>
                                    )}
                                    <Typography sx={{
                                        fontSize: '0.82rem',
                                        fontWeight: isHeader ? 700 : 500,
                                        color: itemColor,
                                        lineHeight: 1.4,
                                    }}>
                                        {option.label}
                                    </Typography>
                                </MenuItem>
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Popover>
        </React.Fragment>
    );
};

export default PopoverComponent;
