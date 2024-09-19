import React from 'react';
import Popover from '@mui/material/Popover';
import { IPopover } from './interface';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { IOptions } from '../tables/interface';

const PopoverComponent = ({
    setAnchorEl,
    anchorEl,
    options,
    handleOptionClicked,
    moduleID
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
                        onClick={() => handleOptionClicked?.(option.value, moduleID)}
                        value={option.value}>
                        {option?.icon && <ListItemIcon>
                            {option?.icon}
                        </ListItemIcon>}
                        <ListItemText primary={option.label} />
                    </MenuItem>))}
            </Popover>
        </React.Fragment>
    )
}

export default PopoverComponent;