/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import Popover from '@mui/material/Popover';
import { IPopover } from './interface';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { IOptions } from '../tables/interface';
import { teal } from '@mui/material/colors';
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
            >
                {options.map((option: IOptions) => (
                    <MenuItem
                        sx={{ bgcolor: `${option?.header ? teal[50] : ''}` }}
                        onClick={() => {
                            handleOptionClicked?.(option.value, moduleID);
                            handleClose()
                        }}
                        value={option.value}>
                        {option?.icon && <ListItemIcon>
                            {option?.icon}
                        </ListItemIcon>}
                        <ListItemText
                            primary={
                                <TypographyComponent
                                    size="16px"
                                    sx={{ color: `${option?.header ? teal[700] : ''}` }}
                                    weight={option?.header ? 500 : 400} >
                                    {option.label}
                                </TypographyComponent>
                            }
                        />
                    </MenuItem>))}
            </Popover>
        </React.Fragment>
    )
}

export default PopoverComponent;