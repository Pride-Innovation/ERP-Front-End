import { INavigation } from "../request/interface";
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { IPermission } from "../settings/interface";
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LaptopChromebookOutlinedIcon from '@mui/icons-material/LaptopChromebookOutlined';
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useParams } from "react-router-dom";
import RoutesUtills from "../../core/routes/utills";
import { useState } from "react";

const StoreTabs = () => {

    const { routePermission } = RoutesUtills();
    const [path, setPath] = useState<string>("");
    const { id } = useParams<{ id: string }>();

    const navigations: Array<INavigation> = [
        {
            id: 1,
            text: "Admin Store",
            path: "/requests/pending",
            icon: <AdminPanelSettingsOutlinedIcon color='warning' />,
            permission: routePermission(12) as IPermission
        },
        {
            id: 3,
            text: "IT Store",
            path: "/requests/rejected",
            icon: <LaptopChromebookOutlinedIcon color='info' />,
            permission: routePermission(16) as IPermission
        },
        {
            id: 4,
            text: "Disposal Store",
            path: "/requests/issued",
            icon: <DeleteOutlinedIcon sx={{ color: "error.main" }} />,
            permission: routePermission(16) as IPermission
        }
    ]

    const determineActivePath = (item: INavigation): boolean => {
        if (path === `${item.path}/${id}`) return true;
        return [item.path].includes(path);
    }
    return (

        <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
            <Grid item xs={12} sm="auto">
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(8,121,108,0.1)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <InventoryOutlinedIcon fontSize='small' />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
                            Stores
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                            {navigations.find(item => determineActivePath(item))?.text || 'Record'}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={12} sm="auto">
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                    {navigations.map(item => (
                        <Button
                            key={item.id}
                            startIcon={item.icon}
                            onClick={() => console.log(`Navigate to ${item.path}`)}
                            variant={determineActivePath(item) ? "contained" : "text"}
                            size="small"
                            sx={{
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: determineActivePath(item) ? 600 : 500,
                                fontSize: '0.8rem',
                                px: 1.5,
                                py: 0.75,
                                boxShadow: determineActivePath(item) ? '0 2px 8px rgba(8,121,108,0.25)' : 'none',
                                bgcolor: determineActivePath(item) ? 'primary.main' : 'transparent',
                                color: determineActivePath(item) ? '#fff' : 'text.secondary',
                                '&:hover': {
                                    bgcolor: determineActivePath(item) ? 'primary.dark' : 'rgba(8,121,108,0.06)',
                                    color: determineActivePath(item) ? '#fff' : 'primary.main',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {item.text}
                        </Button>
                    ))}
                </Stack>
            </Grid>
        </Grid>
    )
}

export default StoreTabs