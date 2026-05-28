/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Avatar,
    Badge,
    Box,
    Container,
    Divider,
    Stack,
    Toolbar
} from '@mui/material'
import React, { useState } from 'react'
// import ButtonComponent from '../forms/Button'
import { TypographyComponent } from '../headers/TypographyComponent';
import PopoverComponent from '../forms/Popover';
// import { crudStates } from '../../utils/constants';
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
import { brand, neutral } from '../../utils/tokens';

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
            <Toolbar disableGutters sx={{ minHeight: { xs: 52, sm: 56 } }}>
                {getCurrentUser() &&
                    <Stack direction="row" spacing={1.75} sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                        <FilterByTagName />
                        {/* <Box>
                            <ButtonComponent
                                handleClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                    setAction(crudStates.create)
                                    handleAnchorClick?.(event);
                                }}
                                sendingRequest={false}
                                buttonText="+ New"
                                buttonColor='secondary'
                                type='button' />
                        </Box> */}
                        <Badge
                            badgeContent={unreadCount > 0 ? unreadCount : undefined}
                            color="warning"
                            overlap="circular"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontWeight: 700,
                                    fontSize: '0.6rem',
                                    minWidth: 18,
                                    height: 18,
                                    border: `2px solid ${neutral[0]}`,
                                    px: 0.5,
                                }
                            }}
                        >
                            <Box
                                onClick={(e) => setNotifAnchor(e.currentTarget)}
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    bgcolor: neutral[100],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: `1px solid ${neutral[200]}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: alpha(brand[500], 0.08),
                                        borderColor: alpha(brand[500], 0.3),
                                        '& svg': { color: brand[600] },
                                    },
                                }}
                            >
                                <NotificationsNoneIcon sx={{ color: neutral[600], fontSize: '1.25rem', transition: 'color 0.2s ease' }} />
                            </Box>
                        </Badge>
                        <NotificationPanel
                            anchor={notifAnchor}
                            onClose={() => setNotifAnchor(null)}
                        />
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                                my: 1,
                                borderColor: neutral[200],
                                display: { xs: 'none', sm: 'block' },
                            }}
                        />
                        <Stack
                            direction="row"
                            spacing={1.25}
                            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                setAction("")
                                handleAnchorClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>)
                            }}
                            sx={{
                                alignItems: 'center',
                                cursor: 'pointer',
                                pl: 0.5,
                                pr: { xs: 0, lg: 1 },
                                py: 0.5,
                                borderRadius: '999px',
                                transition: 'background-color 0.2s ease',
                                '&:hover': { bgcolor: neutral[100] },
                            }}
                        >
                            <Avatar
                                src={getCurrentUser()?.image || (getCurrentUser()?.gender === 'male' ? MaleLogo : FemaleLogo)}
                                sx={{
                                    height: 36,
                                    width: 36,
                                    border: `2px solid ${neutral[0]}`,
                                    boxShadow: `0 0 0 1px ${neutral[200]}`,
                                }}
                            />
                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', maxWidth: 180, minWidth: 0 }}>
                                <TypographyComponent
                                    size='0.85rem'
                                    weight={600}
                                    sx={{
                                        color: neutral[800],
                                        letterSpacing: 0.2,
                                        lineHeight: 1.25,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {getCurrentUser()?.firstName} {getCurrentUser()?.lastName}
                                </TypographyComponent>
                                {getCurrentUser()?.email &&
                                    <TypographyComponent
                                        size='0.7rem'
                                        weight={500}
                                        sx={{
                                            color: neutral[500],
                                            letterSpacing: 0.1,
                                            lineHeight: 1.25,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {getCurrentUser()?.email}
                                    </TypographyComponent>
                                }
                            </Box>
                        </Stack>
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