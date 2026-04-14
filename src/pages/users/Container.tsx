import {
    alpha,
    Box,
    Stack,
    Typography
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { useContext } from 'react';
import { UserContext } from '../../context/user/UserContext';

const Container = ({ children }: { children: React.ReactNode }) => {
    const { totalUsers } = useContext(UserContext);
    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#F1F5FB', pb: 4 }}>

            {/* ── Gradient Header ─────────────────────────────────── */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #08796C 0%, #065E53 60%, #044a42 100%)',
                    px: { xs: 2, md: 4 },
                    pt: 3,
                    pb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', bottom: -50, right: 140, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
                    {/* Left: icon + title */}
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Box sx={{
                            width: 46, height: 46, borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            flexShrink: 0,
                        }}>
                            <PeopleOutlineIcon sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                                Users Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: alpha('#fff', 0.70), mt: 0.25 }}>
                                Manage system access and user accounts
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Right: stats badge */}
                    <Box
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 2,
                            px: 2.5,
                            py: 1.25,
                            textAlign: 'right',
                            flexShrink: 0,
                            display: { xs: 'none', sm: 'block' },
                        }}
                    >
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1 }}>
                            {(totalUsers ?? 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, display: 'block', mt: 0.25 }}>
                            total users
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', display: 'block', mt: 0.5 }}>
                            {todayLabel}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* ── Page content ─────────────────────────────────────── */}
            <Box sx={{ px: { xs: 1, md: 3 }, pt: 3, width: '100%', maxWidth: '1500px' }}>
                {children}
            </Box>
        </Box>
    );
};

export default Container;