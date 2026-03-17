/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import Popover from '@mui/material/Popover';
import { IPopover } from './interface';
import { alpha, Box, ListItemIcon, ListItemText, MenuItem, useTheme } from '@mui/material';
import { IOptions } from '../tables/interface';
import { TypographyComponent } from '../headers/TypographyComponent';

const PopoverComponent = ({
    setAnchorEl,
    anchorEl,
    options,
    handleOptionClicked,
    moduleID,
}: IPopover) => {

    const handleClose = () => {
        setAnchorEl(null);
    };

    const theme = useTheme();
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <React.Fragment>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                        minWidth: 200,
                        mt: 0.5,
                        overflow: 'visible',
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: -6,
                            left: 16,
                            width: 12,
                            height: 12,
                            bgcolor: '#FFFFFF',
                            transform: 'rotate(45deg)',
                            border: `1px solid ${theme.palette.divider}`,
                            borderBottom: 'none',
                            borderRight: 'none',
                            zIndex: 0,
                        },
                    }
                }}
            >
                <Box sx={{ p: 0.75 }}>
                    {options?.map((option: IOptions, idx: number) => (
                        <MenuItem
                            key={idx}
                            sx={{
                                borderRadius: 1.5,
                                py: 1,
                                px: 1.5,
                                mb: 0.3,
                                bgcolor: option?.header
                                    ? alpha(theme.palette.primary.main, 0.06)
                                    : 'transparent',
                                '&:hover': {
                                    bgcolor: option?.header
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : alpha(theme.palette.primary.main, 0.06),
                                },
                                '&:last-child': { mb: 0 },
                            }}
                            onClick={() => {
                                handleOptionClicked?.(option.value, moduleID);
                                handleClose();
                            }}
                            value={option.value}
                        >
                            {option?.icon && (
                                <ListItemIcon
                                    sx={{
                                        minWidth: 32,
                                        color: option?.header
                                            ? theme.palette.primary.main
                                            : theme.palette.text.secondary,
                                    }}
                                >
                                    {option?.icon}
                                </ListItemIcon>
                            )}
                            <ListItemText
                                primary={
                                    <TypographyComponent
                                        size="0.875rem"
                                        sx={{
                                            color: option?.header
                                                ? theme.palette.primary.main
                                                : theme.palette.text.primary,
                                        }}
                                        weight={option?.header ? 600 : 400}
                                    >
                                        {option.label}
                                    </TypographyComponent>
                                }
                            />
                        </MenuItem>
                    ))}
                </Box>
            </Popover>
        </React.Fragment>
    );
}

export default PopoverComponent;