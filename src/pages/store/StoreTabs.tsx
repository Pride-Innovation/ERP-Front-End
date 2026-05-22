import { INavigation } from "../request/interface";
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LaptopChromebookOutlinedIcon from '@mui/icons-material/LaptopChromebookOutlined';
import { Box, Stack, Tab, Tabs, Typography, alpha, useTheme } from "@mui/material";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useState } from "react";

const StoreTabs = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const navigations: Array<INavigation> = [
        {
            id: 1,
            text: "Admin Store",
            path: "/requests/pending",
            icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 17 }} />,
        },
        {
            id: 3,
            text: "IT Store",
            path: "/requests/rejected",
            icon: <LaptopChromebookOutlinedIcon sx={{ fontSize: 17 }} />,
        },
        {
            id: 4,
            text: "Disposal Store",
            path: "/requests/issued",
            icon: <DeleteOutlinedIcon sx={{ fontSize: 17 }} />,
        }
    ];

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
            {/* Title */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <InventoryOutlinedIcon sx={{ fontSize: 17, color: theme.palette.primary.main }} />
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.67rem', display: 'block' }}>
                        Stores
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                        {navigations[activeTab]?.text ?? 'Record'}
                    </Typography>
                </Box>
            </Stack>

            {/* Tab navigation */}
            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    minHeight: 36,
                    '& .MuiTabs-indicator': {
                        height: 2.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                    },
                    '& .MuiTab-root': {
                        minHeight: 36,
                        minWidth: 'unset',
                        px: 1.75,
                        py: 0.5,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        color: 'text.secondary',
                        borderRadius: '8px 8px 0 0',
                        transition: 'color 0.2s ease, background 0.2s ease',
                        '&.Mui-selected': {
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                        },
                        '&:hover:not(.Mui-selected)': {
                            color: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                    },
                }}
            >
                {navigations.map((item, idx) => (
                    <Tab
                        key={item.id}
                        icon={item.icon as React.ReactElement}
                        iconPosition="start"
                        label={item.text}
                        sx={{ gap: 0.5 }}
                    />
                ))}
            </Tabs>
        </Stack>
    );
};

export default StoreTabs;