import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import React from 'react';
import ButtonComponent from './Button';
import { IPopover } from './interface';

const PopoverComponent = ({ buttonText }: IPopover) => {
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
                <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
            </Popover>
        </React.Fragment>
    )
}

export default PopoverComponent