import {
    Avatar,
    Badge,
    Box,
    Container,
    IconButton,
    Stack,
    Toolbar
} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import ButtonComponent from '../forms/Button'
import { TypographyComponent } from '../headers/TypographyComponent';
import PopoverComponent from '../forms/Popover';
import { UserContext } from '../../context/user/UserContext';
import { usersMock } from '../../mocks/users';
import { crudStates } from '../../utils/constants';
import MaleLogo from '../../statics/images/male.jpg';
import FemaleLogo from '../../statics/images/Female.jpg'
import { grey } from '@mui/material/colors';
import AppBarUtills, { modalStates } from './utills';
import ModalComponent from '../modal';
import ChangePassword from '../../pages/profile/ChangePassword';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const NavBar = () => {
    const { user, setUser } = useContext(UserContext);
    useEffect(() => { setUser(usersMock[0]) }, []);
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
                {user &&
                    <Stack direction="row" spacing={4} sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                        <Box>
                            <ButtonComponent
                                handleClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                    setAction(crudStates.create)
                                    handleAnchorClick?.(event);
                                }}
                                sendingRequest={false}
                                buttonText="Create New"
                                buttonColor='info'
                                type='button' />
                        </Box>
                        <Badge badgeContent={4} color="warning">
                            <NotificationsNoneIcon color="inherit" />
                        </Badge>
                        <TypographyComponent size='16px' weight={400} sx={{ color: grey[100] }}>
                            {user?.firstName} {user?.lastName}
                        </TypographyComponent>
                        <IconButton
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                setAction("")
                                handleAnchorClick?.(event)
                            }}>
                            <Avatar src={user?.gender === 'Male' ? MaleLogo : FemaleLogo} sx={{ height: 45, width: 45, cursor: "pointer" }} />
                        </IconButton>
                    </Stack>}
                <PopoverComponent
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    moduleID={user.id}
                    handleOptionClicked={handleOptionClicked}
                    options={options(action)} />

            </Toolbar>
        </Container >

    )
}

export default NavBar