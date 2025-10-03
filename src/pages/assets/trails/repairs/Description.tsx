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
    useMediaQuery,
    Badge
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
    Close as CloseIcon,
    CheckCircleOutline as CompletedIcon,
    Note as NoteIcon,
    AttachFile as AttachmentIcon
} from '@mui/icons-material';
import { IRepairDetails } from '../../interface';
import moment from 'moment';

interface DescriptionProps {
    repair: IRepairDetails;
    handleClose?: () => void;
    handleViewAttachments?: () => void;
}

const Description = ({ repair, handleClose, handleViewAttachments }: DescriptionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    const isCompleted = repair?.repairEndDate && repair?.repairEndDate !== '';
    const status = repair?.status === "Completed" ? 'Completed' : 'Pending';
    const statusColor = repair.status === "Completed" ? theme.palette.success.main : theme.palette.warning.main;
    const hasCompletionDocuments = repair?.completionDocuments && repair.completionDocuments.length > 0;


    return (
        <Box sx={{
            p: { xs: 0.75, sm: 1 },
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                py: 0.5
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BuildIcon
                        color="primary"
                        sx={{ mr: 1, fontSize: 24 }}
                    />
                    <Typography variant="h6" fontWeight={500} color="text.primary">
                        Repair #{repair?.id}
                    </Typography>
                </Box>
                <Chip
                    label={status}
                    size="small"
                    sx={{
                        bgcolor: alpha(statusColor, 0.1),
                        color: statusColor,
                        fontWeight: 600,
                        border: `1px solid ${alpha(statusColor, 0.3)}`,
                        px: 1
                    }}
                />
            </Box>

            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Grid container spacing={1.5}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                height: '100%',
                                borderRadius: 1.5,
                                border: `1px solid ${alpha('#000', 0.08)}`
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                    p: 0.5,
                                    borderRadius: 1,
                                    display: 'flex',
                                    mr: 1
                                }}>
                                    <BuildIcon fontSize="small" />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Repair Information
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 1.5 }} />

                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <CalendarIcon
                                        sx={{ mt: 0.3, mr: 1, fontSize: 18, color: alpha(theme.palette.text.secondary, 0.7) }}
                                    />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Repair Timeline
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={500} color="text.primary">
                                                {repair?.repairStartDate ? moment(repair?.repairStartDate).format('MMM DD, YYYY') : 'Not specified'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mx: 1 }} color="text.secondary">
                                                to
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500} color={isCompleted ? "text.primary" : "text.secondary"} fontStyle={isCompleted ? "normal" : "italic"}>
                                                {isCompleted ? moment(repair?.repairEndDate).format('MMM DD, YYYY') : 'In Progress'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <TechnicianIcon
                                        sx={{ mt: 0.3, mr: 1, fontSize: 18, color: alpha(theme.palette.text.secondary, 0.7) }}
                                    />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Technician
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.primary">
                                            {repair.technician || 'Not assigned'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <DescriptionIcon
                                        sx={{ mt: 0.3, mr: 1, fontSize: 18, color: alpha(theme.palette.text.secondary, 0.7) }}
                                    />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Reason for Repair
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                p: 1,
                                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                                borderRadius: 1,
                                                border: `1px solid ${alpha('#000', 0.05)}`,
                                                whiteSpace: 'pre-wrap',
                                                maxHeight: '80px',
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {repair.repairReason || 'No reason provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                height: '100%',
                                borderRadius: 1.5,
                                border: `1px solid ${alpha('#000', 0.08)}`
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                    color: theme.palette.secondary.main,
                                    p: 0.5,
                                    borderRadius: 1,
                                    display: 'flex',
                                    mr: 1
                                }}>
                                    <InventoryIcon fontSize="small" />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Asset Information
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 1.5 }} />

                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Asset Name
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {repair.asset?.assetName}
                                    </Typography>
                                </Box>

                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <CategoryIcon
                                                fontSize="small"
                                                sx={{ mt: 0.3, mr: 0.75, color: theme.palette.info.main }}
                                            />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Asset Type
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {repair.asset?.assetType?.name || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <FingerprintIcon
                                                fontSize="small"
                                                sx={{ mt: 0.3, mr: 0.75, color: theme.palette.warning.main }}
                                            />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Engraved Number
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {repair.asset?.engravedNumber || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Make/Model
                                        </Typography>
                                        <Typography variant="body2" color="text.primary">
                                            {repair.asset?.make}
                                            {repair.asset?.model ? ` - ${repair.asset.model}` : ''}
                                        </Typography>
                                    </Box>
                                </Box>

                                {repair.asset?.branch && (
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <LocationIcon
                                            fontSize="small"
                                            sx={{ mt: 0.3, mr: 0.75, color: theme.palette.error.main }}
                                        />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                Location
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {repair.asset.branch.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    {isCompleted && (
                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 1.5, sm: 2 },
                                    borderRadius: 1.5,
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                    bgcolor: alpha(theme.palette.success.main, 0.02)
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                                    <Box sx={{
                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                        color: theme.palette.success.main,
                                        p: 0.5,
                                        borderRadius: 1,
                                        display: 'flex',
                                        mr: 1
                                    }}>
                                        <CompletedIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="subtitle2" fontWeight={600} color="success.main">
                                        Repair Completion Details
                                    </Typography>
                                    <Chip
                                        label={`Completed on ${moment(repair.repairEndDate).format('MMM DD, YYYY')}`}
                                        size="small"
                                        sx={{
                                            ml: { xs: 0, sm: 1.5 },
                                            mt: { xs: 0.5, sm: 0 },
                                            bgcolor: alpha(theme.palette.success.main, 0.1),
                                            color: theme.palette.success.main,
                                            fontWeight: 500,
                                            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                            fontSize: '0.7rem',
                                            height: 20
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ mb: 1.5, borderColor: alpha(theme.palette.success.main, 0.1) }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={hasCompletionDocuments ? 7 : 12}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <NoteIcon
                                                sx={{
                                                    mt: 0.3,
                                                    mr: 1,
                                                    fontSize: 18,
                                                    color: theme.palette.success.main
                                                }}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                    Completion Notes
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        p: 1,
                                                        bgcolor: alpha(theme.palette.success.main, 0.05),
                                                        borderRadius: 1,
                                                        border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                                                        whiteSpace: 'pre-wrap',
                                                        maxHeight: '70px',
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    {repair.completionNotes || 'No completion notes provided'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {hasCompletionDocuments && (
                                        <Grid item xs={12} md={5}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                                borderLeft: isMediumScreen ? 'none' : `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                                                pl: isMediumScreen ? 0 : 1.5,
                                                pt: isMediumScreen ? 0 : 0
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                    <Badge
                                                        badgeContent={repair.completionDocuments?.length || 0}
                                                        color="primary"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <AttachmentIcon
                                                            sx={{
                                                                fontSize: 18,
                                                                color: theme.palette.primary.main
                                                            }}
                                                        />
                                                    </Badge>
                                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                        Completion Documents
                                                    </Typography>
                                                </Box>

                                                <Box sx={{
                                                    p: 1,
                                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                                    borderRadius: 1,
                                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexGrow: 1
                                                }}>
                                                    <Typography variant="body2" color="text.primary" fontWeight={600}>
                                                        {repair.completionDocuments?.length} Document{repair.completionDocuments?.length !== 1 ? 's' : ''}
                                                    </Typography>

                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        onClick={handleViewAttachments}
                                                        startIcon={<AttachmentIcon fontSize="small" />}
                                                        sx={{
                                                            mt: 1,
                                                            borderRadius: 1,
                                                            textTransform: 'none',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        View Documents
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {handleClose && (
                <>
                    <Divider sx={{ mt: 'auto', my: 1 }} />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 2,
                            py: 0.5
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleClose}
                            startIcon={<CloseIcon />}
                            sx={{
                                borderRadius: 1.5,
                                minWidth: '120px',
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