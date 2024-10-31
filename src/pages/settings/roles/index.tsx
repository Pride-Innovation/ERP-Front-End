import { Box, Typography } from '@mui/material'
import ButtonComponent from '../../../components/forms/Button';
import RoleDetails from './RoleDetails';
import { rolesMock } from '../../../mocks/settings';
import { IRole } from '../interface';

const Roles = () => {

    return (
        <Box sx={{ py: 4 }}>
            <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                mb: 4,
                alignItems: "center",
            }}>
                <Typography sx={{ fontWeight: 600, textTransform: "none", fontSize: '17px' }}>Accounts Settings</Typography>
                <Box>
                    <ButtonComponent
                        handleClick={() => console.log("Clicked")}
                        sendingRequest={false}
                        buttonText="Creat New Role"
                        variant='contained'
                        buttonColor='info'
                        type='button' />
                </Box>
            </Box>
            <Box
                display="grid"
                sx={{ width: "100%" }}
                gridTemplateColumns="1fr"
                gap={4}
            >
                {
                    rolesMock.map((role: IRole) => {
                        return (
                            <RoleDetails role={role} />
                        )
                    })
                }
            </Box>

        </Box>
    )
}

export default Roles;