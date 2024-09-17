import Popover from '@mui/material/Popover';
import React from 'react';
import ButtonComponent from './Button';
import { IPopover } from './interface';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { IOptions } from '../tables/interface';

const PopoverComponent = ({ buttonText, options, handleOptionClicked, moduleID }: IPopover) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <React.Fragment>
            <ButtonComponent
                handleClick={(
                    event: React.MouseEvent<HTMLButtonElement>
                ) => handleClick?.(event)}
                sendingRequest={false}
                buttonText={buttonText}
                variant='outlined'
                buttonColor='info'
                type='button' />

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

export default PopoverComponent