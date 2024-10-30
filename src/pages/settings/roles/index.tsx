import { Card } from '@mui/material'
import { FormHeader } from '../../../components/headers/TypographyComponent'
import RoleCard from './RoleCard';



const Roles = () => {
    return (
        <Card sx={{ p: 4 }}>
            <FormHeader header='Roles and Permissions' />
            <RoleCard />
        </Card>
    )
}

export default Roles;