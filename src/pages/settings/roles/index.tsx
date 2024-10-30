import { Box, Card, Typography } from '@mui/material'
import RoleCard from './RoleCard';
import { IModule } from '../interface';
import ButtonComponent from '../../../components/forms/Button';
import RoleUtills from './utills';


const Roles = () => {
    const { modulesList } = RoleUtills();
    
    return (
        <Card sx={{ p: 4 }}>
            <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                mb: 4,
                alignItems: "center",
            }}>
                <Typography sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: '17px' }}>Roles and Permissions</Typography>
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
                gridTemplateColumns="1fr 1fr"
                gap={4}
            >
                {
                    modulesList.map((module: IModule) => {
                        return (<RoleCard module={module} />)
                    })
                }
            </Box>

        </Card>
    )
}

export default Roles;