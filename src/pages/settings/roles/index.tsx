import { Box, Card } from '@mui/material'
import { FormHeader } from '../../../components/headers/TypographyComponent'
import RoleCard from './RoleCard';
import BalanceIcon from '@mui/icons-material/Balance';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import GroupIcon from '@mui/icons-material/Group';
import { IModule } from '../interface';


const Roles = () => {
    return (
        <Card sx={{ p: 4 }}>
            <FormHeader header='Roles and Permissions' />
            <Box
                display="grid"
                sx={{ width: "100%" }}
                gridTemplateColumns="repeat(2 1fr)"
                gap={4}
            >
                {
                    [
                        {
                            id: 1,
                            icon: <SettingsBrightnessIcon fontSize='small' color='info' />,
                            name: "IT Equipment"
                        },
                        {
                            id: 2,
                            icon: <BalanceIcon fontSize='small' color='info' />,
                            name: "Office Equipment"
                        },
                        {
                            id: 3,
                            icon: <DirectionsCarFilledIcon fontSize='small' color='info' />,
                            name: "Fleet"
                        },
                        {
                            id: 4,
                            icon: <GroupIcon fontSize='small' color='info' />,
                            name: "Users"
                        }
                    ].map((module: IModule) => {
                        return (<RoleCard module={module} />)
                    })
                }
            </Box>

        </Card>
    )
}

export default Roles;