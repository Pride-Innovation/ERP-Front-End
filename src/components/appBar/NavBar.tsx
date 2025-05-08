/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Avatar,
    Badge,
    Box,
    Container,
    IconButton,
    Stack,
    Toolbar
} from '@mui/material'
import React, { useState } from 'react'
import ButtonComponent from '../forms/Button'
import { TypographyComponent } from '../headers/TypographyComponent';
import PopoverComponent from '../forms/Popover';
import { crudStates } from '../../utils/constants';
import MaleLogo from '../../statics/images/male.jpg';
import FemaleLogo from '../../statics/images/Female.jpg'
import { grey } from '@mui/material/colors';
import AppBarUtills, { modalStates } from './utills';
import ModalComponent from '../modal';
import ChangePassword from '../../pages/profile/ChangePassword';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import RoutesUtills from '../../core/routes/utills';

const NavBar = () => {
    const { getCurrentUser } = RoutesUtills();
    const [action, setAction] = useState<string>("");
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleAnchorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const {
        handleClose,
        modalState,
        open,
        handleOptionClicked,
        options
    } = AppBarUtills();

    return (
        <Container maxWidth="xl">
            {modalState === modalStates.password &&
                <ModalComponent title='Change Password' open={open} handleClose={handleClose} width="40%">
                    <ChangePassword handleClose={handleClose} />
                </ModalComponent>
            }
            <Toolbar disableGutters>
                {getCurrentUser() &&
                    <Stack direction="row" spacing={4} sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                        <Box>
                            <ButtonComponent
                                handleClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                    setAction(crudStates.create)
                                    handleAnchorClick?.(event);
                                }}
                                sendingRequest={false}
                                buttonText="Create New"
                                buttonColor='secondary'
                                type='button' />
                        </Box>
                        <Badge badgeContent={4} color="warning">
                            <NotificationsNoneIcon color="inherit" />
                        </Badge>
                        <TypographyComponent size='16px' weight={400} sx={{ color: grey[100] }}>
                            {getCurrentUser()?.name}
                        </TypographyComponent>
                        <IconButton
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                setAction("")
                                handleAnchorClick?.(event)
                            }}>
                            <Avatar
                                src={getCurrentUser()?.image || (getCurrentUser()?.gender === 'male' ? MaleLogo : FemaleLogo)}
                                sx={{ height: 45, width: 45, cursor: "pointer" }} />
                        </IconButton>
                    </Stack>}
                <PopoverComponent
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    moduleID={getCurrentUser().id}
                    handleOptionClicked={handleOptionClicked}
                    options={options(action)} />

            </Toolbar>
        </Container >

    )
}

export default NavBar