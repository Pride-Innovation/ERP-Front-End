import { useContext, useEffect } from 'react';
import { fetchRowsService } from '../../../core/apis/globalService';
import { GridRowsProp } from '@mui/x-data-grid';
import RowContext from '../../../context/row/RowContext';
import RoleUtills from './utills';
import { rolesMock } from '../../../mocks/settings';
import { Box, Card, Grid, IconButton, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { IRoleCard } from '../interface';
import RoleRow from './RoleRow';

const RoleCard = ({ module }: IRoleCard) => {
    const { setRows } = useContext(RowContext);
    const { endPoint, setRoles, roles } = RoleUtills();

    const fetchResources = async () => {
        try {
            const response = await fetchRowsService(
                {
                    page: 1,
                    size: 10,
                    endPoint
                }
            ) as unknown as GridRowsProp;

            setRows([...response]);
            setRoles([...rolesMock]);

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => { fetchResources() }, []);

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
                        roles.map(role => (<RoleRow role={role} module={module}/>))
                    }
                </Card >
            </Box>
        </Grid>
    )
}

export default RoleCard