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
import AppBarUtills, { modalStates } from './utills';
import ModalComponent from '../modal';
import ChangePassword from '../../pages/profile/ChangePassword';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import RoutesUtills from '../../core/routes/utills';
import FilterByTagName from './FilterByTagName';
import { useNotifications } from '../../context/notification/NotificationContext';
import NotificationPanel from './NotificationPanel';

const NavBar = () => {
    const { getCurrentUser } = RoutesUtills();
    const [action, setAction] = useState<string>("");
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
    const { unreadCount } = useNotifications();

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
                <ModalComponent title='Change Password' open={open} handleClose={handleClose} width="60%">
                    <ChangePassword handleClose={handleClose} />
                </ModalComponent>
            }
            <Toolbar disableGutters>
                {getCurrentUser() &&
                    <Stack direction="row" spacing={2} sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                        <FilterByTagName />
                        <Box>
                            <ButtonComponent
                                handleClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                    setAction(crudStates.create)
                                    handleAnchorClick?.(event);
                                }}
                                sendingRequest={false}
                                buttonText="+ New"
                                buttonColor='secondary'
                                type='button' />
                        </Box>
                        <Badge
                            badgeContent={unreadCount > 0 ? unreadCount : undefined}
                            color="warning"
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontWeight: 700,
                                    fontSize: '0.6rem',
                                    minWidth: 18,
                                    height: 18,
                                }
                            }}
                        >
                            <Box
                                onClick={(e) => setNotifAnchor(e.currentTarget)}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                }}
                            >
                                <NotificationsNoneIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' }} />
                            </Box>
                        </Badge>
                        <NotificationPanel
                            anchor={notifAnchor}
                            onClose={() => setNotifAnchor(null)}
                        />
                        <TypographyComponent
                            size='0.875rem'
                            weight={600}
                            sx={{
                                color: 'rgba(255,255,255,0.92)',
                                display: { xs: 'none', lg: 'block' },
                                letterSpacing: 0.2,
                            }}
                        >
                            {getCurrentUser()?.firstName} {getCurrentUser()?.lastName}
                        </TypographyComponent>
                        <IconButton
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                setAction("")
                                handleAnchorClick?.(event)
                            }}
                            sx={{
                                p: 0.5,
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '50%',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    border: '2px solid rgba(255,255,255,0.6)',
                                    boxShadow: '0 0 0 3px rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            <Avatar
                                src={getCurrentUser()?.image || (getCurrentUser()?.gender === 'male' ? MaleLogo : FemaleLogo)}
                                sx={{ height: 36, width: 36, cursor: "pointer" }} />
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