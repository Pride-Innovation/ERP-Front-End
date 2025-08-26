import {
    Box,
    Grid,
    Paper,
    Typography,
    Divider,
    Chip,
    Stack,
    useTheme,
    alpha,
    Button,
    useMediaQuery
} from '@mui/material';
import {
    CalendarMonth as CalendarIcon,
    Engineering as TechnicianIcon,
    Build as BuildIcon,
    Description as DescriptionIcon,
    Inventory as InventoryIcon,
    AccountTree as CategoryIcon,
    Fingerprint as FingerprintIcon,
    LocationOn as LocationIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { IRepairDetails } from '../../interface';
import moment from 'moment';

interface DescriptionProps {
    repair: IRepairDetails;
    handleClose?: () => void; // Added optional handleClose prop
}

const Description = ({ repair, handleClose }: DescriptionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const isCompleted = repair.repairEndDate && repair.repairEndDate !== '';
    const status = isCompleted ? 'Completed' : 'Pending';
    const statusColor = isCompleted ? theme.palette.success.main : theme.palette.warning.main;


    return (
        <Box sx={{ 
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BuildIcon
                        color="primary"
                        sx={{ mr: 1.5, fontSize: 28 }}
                    />
                    <Typography variant="h6" fontWeight={500} color="text.primary">
                        Repair #{repair.id}
                    </Typography>
                </Box>
                <Chip
                    label={status}
                    sx={{
                        bgcolor: alpha(statusColor, 0.1),
                        color: statusColor,
                        fontWeight: 600,
                        border: `1px solid ${alpha(statusColor, 0.3)}`,
                        px: 1
                    }}
                />
            </Box>

            {/* Main content - made to flex-grow to push button to bottom */}
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={3}>
                    {/* Repair Information section */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                height: '100%',
                                borderRadius: 1.5,
                                border: `1px solid ${alpha('#000', 0.08)}`
                            }}
                        >
                            {/* ...rest of repair information section... */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                                <Box sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                    p: 0.7,
                                    borderRadius: 1,
                                    display: 'flex',
                                    mr: 1.5
                                }}>
                                    <BuildIcon fontSize="small" />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Repair Information
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2.5}>
                                {/* Timeline section */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <CalendarIcon
                                        color="action"
                                        sx={{ mt: 0.5, mr: 1.5, fontSize: 20, color: alpha(theme.palette.text.secondary, 0.7) }}
                                    />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Repair Timeline
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <Typography variant="body1" fontWeight={500} color="text.primary">
                                                {repair.repairStartDate ? moment(repair.repairStartDate).format('MMM DD, YYYY') : 'Not specified'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mx: 1 }} color="text.secondary">
                                                to
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500} color={isCompleted ? "text.primary" : "text.secondary"} fontStyle={isCompleted ? "normal" : "italic"}>
                                                {isCompleted ? moment(repair.repairEndDate).format('MMM DD, YYYY') : 'In Progress'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Technician section */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <TechnicianIcon
                                        color="action"
                                        sx={{ mt: 0.5, mr: 1.5, fontSize: 20, color: alpha(theme.palette.text.secondary, 0.7) }}
                                    />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Technician
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500} color="text.primary" mt={0.5}>
                                            {repair.technician || 'Not assigned'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Repair reason section */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <DescriptionIcon
                                        color="action"
                                        sx={{ mt: 0.5, mr: 1.5, fontSize: 20, color: alpha(theme.palette.text.secondary, 0.7) }}
                                    />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Reason for Repair
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                mt: 0.5,
                                                p: 1.5,
                                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                                borderRadius: 1,
                                                border: `1px solid ${alpha('#000', 0.05)}`,
                                                whiteSpace: 'pre-wrap'
                                            }}
                                        >
                                            {repair.repairReason || 'No reason provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Asset Information section */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                height: '100%',
                                borderRadius: 1.5,
                                border: `1px solid ${alpha('#000', 0.08)}`
                            }}
                        >
                            {/* ...rest of asset information section... */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                                <Box sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                    color: theme.palette.secondary.main,
                                    p: 0.7,
                                    borderRadius: 1,
                                    display: 'flex',
                                    mr: 1.5
                                }}>
                                    <InventoryIcon fontSize="small" />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Asset Information
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Asset Name
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600} color="text.primary" mt={0.5}>
                                        {repair.asset?.assetName}
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CategoryIcon
                                                fontSize="small"
                                                sx={{ mr: 1, color: theme.palette.info.main }}
                                            />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Asset Type
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                                                    {repair.asset?.assetType?.name || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <FingerprintIcon
                                                fontSize="small"
                                                sx={{ mr: 1, color: theme.palette.warning.main }}
                                            />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Engraved Number
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                                                    {repair.asset?.engravedNumber || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Make/Model
                                    </Typography>
                                    <Typography variant="body1" color="text.primary" mt={0.5}>
                                        {repair.asset?.make}
                                        {repair.asset?.model ? ` - ${repair.asset.model}` : ''}
                                    </Typography>
                                </Box>

                                {repair.asset?.branch && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <LocationIcon
                                            fontSize="small"
                                            sx={{ mr: 1, color: theme.palette.error.main }}
                                        />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                Location
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                                                {repair.asset.branch.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Action buttons - only shown if handleClose is provided */}
            {handleClose && (
                <>
                    <Divider sx={{ mt: 'auto', my: 2 }} />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row'
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleClose}
                            startIcon={<CloseIcon />}
                            sx={{
                                borderRadius: 1.5,
                                px: 2.5,
                                py: 1,
                                minWidth: isMobile ? '100%' : '120px',
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default Description;