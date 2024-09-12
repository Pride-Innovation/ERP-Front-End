import Popover from '@mui/material/Popover';
import React from 'react';
import ButtonComponent from './Button';
import { IPopover } from './interface';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const PopoverComponent = ({ buttonText, options }: IPopover) => {
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
                {options.map(option => (<MenuItem value={option.value}>
                    <ListItemIcon>
                        <InfoIcon />
                    </ListItemIcon>
                    <ListItemText primary={option.label} />
                </MenuItem>))}
            </Popover>
        </React.Fragment>
    )
}

export default PopoverComponent