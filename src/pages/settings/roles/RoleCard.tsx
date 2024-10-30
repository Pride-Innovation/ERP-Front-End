import { useContext, useEffect, useState } from 'react';
import { fetchRowsService } from '../../../core/apis/globalService';
import { GridRowsProp } from '@mui/x-data-grid';
import RowContext from '../../../context/row/RowContext';
import RoleUtills from './utills';
import { permissionsMock, rolesMock } from '../../../mocks/settings';
import { Box, Card, Grid, IconButton, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { IModule, IRole } from '../interface';
import CheckboxComponent from '../../../components/forms/CheckBox';
import TuneIcon from '@mui/icons-material/Tune';

interface IRoleRow {
    role: IRole
}
const RoleRow = ({ role }: IRoleRow) => {
    return (
        <Box
            display="grid"
            sx={{ width: "100%", alignItems: "center" }}
            gridTemplateColumns="6fr 1fr 1fr 1fr 1fr "
            gap={4}
            px={3}
            py={0.5}
        >
            <Typography variant="body2">{role.name}</Typography>
            <CheckboxComponent />
            <CheckboxComponent />
            <CheckboxComponent />
            <CheckboxComponent />
        </Box>
    )
}

interface IRoleCard {
    module: IModule
}

const RoleCard = ({ module }: IRoleCard) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { setRows } = useContext(RowContext);
    const { endPoint, setPermissions } = RoleUtills();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService(
                {
                    page: 1,
                    size: 10,
                    endPoint
                }
            ) as unknown as GridRowsProp;

            setRows([...response]);
            setPermissions([...permissionsMock]);

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);

    console.log(loading, "loading!!");

    return (
        <Grid container xs={12} >
            <Box
                display="grid"
                sx={{ width: "100%" }}
                gridTemplateColumns="1fr"
                gap={4}
            >
                <Card sx={{
                    boxShadow: 0,
                    border: `2px solid ${grey[200]}`,
                }}>
                    <Box
                        display="grid"
                        sx={{ width: "100%", alignItems: "center" }}
                        gridTemplateColumns="6fr 1fr 1fr 1fr 1fr "
                        gap={4}
                        px={3}
                        py={1.5}
                    >
                        <Typography variant="body1">Action</Typography>
                        <Typography variant='body2'>Create</Typography>
                        <Typography variant='body2'>Read</Typography>
                        <Typography variant='body2'>Update</Typography>
                        <Typography variant='body2'>Delete</Typography>
                    </Box>
                    <Box sx={{
                        borderTop: `2px solid ${grey[200]}`,
                        borderBottom: `2px solid ${grey[100]}`,
                        px: 1.5,
                        py: 0.5,
                        bgcolor: grey[50],
                        display: "flex",
                        alignItems: "center"
                    }} >
                        <IconButton>
                            {module.icon}
                        </IconButton>
                        <Typography variant='body2' sx={{ fontWeight: 600, ml: 2 }}>{module.name}</Typography>
                    </Box>
                    {
                        rolesMock.map(role => (<RoleRow role={role} />))
                    }
                </Card >
            </Box>
        </Grid>
    )
}

export default RoleCard