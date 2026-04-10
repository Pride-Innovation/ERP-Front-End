/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useNavigate, useParams } from "react-router"
import { useContext, useEffect, useState } from "react";
import { InventoryContext } from "../../../context/inventory";
import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Stack,
    Typography,
    useTheme,
    alpha,
    Chip,
    Paper,
    Container,
    Button as MuiButton,
    Tooltip,
    IconButton
} from "@mui/material";
import TabComponent from "../../../components/tabs";
import OtherDetails from "./OtherDetails";
import moment from "moment";
import ViewInventoryutills from "./utills";
import ModalComponent from "../../../components/modal";
import InventoryUtills from "../Utills";
import InventoryPRN from "./InventoryGRN";
import { IGRNReport } from "../interface";
import Loading from "../../../components/loading";
import { toast } from "react-toastify";

// Material Icons
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { camelCaseToWords } from "../../../utils/helpers";

// Define brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Enhanced DetailSection component to match ITEquipmentDetails style
const EnhancedDetailSection = ({
    label,
    text,
    icon,
    chip,
    emptyMessage = "Not specified"
}: {
    label: string;
    text: string | null;
    icon?: JSX.Element;
    chip?: JSX.Element;
    emptyMessage?: string;
}) => {
    const isEmpty = text === null || text === undefined || text === '';

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: 1.8,
                mb: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${alpha('#000', 0.06)}`,
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: alpha(PRIMARY_COLOR, 0.3),
                    boxShadow: `0 2px 8px ${alpha('#000', 0.05)}`,
                    bgcolor: alpha('#fff', 0.9)
                }
            }}
        >
            <Box
                sx={{
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                    color: PRIMARY_COLOR,
                    width: 34,
                    height: 34,
                    flexShrink: 0
                }}
            >
                {icon}
            </Box>

            <Box sx={{ width: '100%' }}>
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{ fontWeight: 500, mb: 0.5 }}
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: isEmpty ? 400 : 500,
                        color: isEmpty ? 'text.disabled' : 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    {chip ? (
                        chip
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {isEmpty ? (
                                <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                    {emptyMessage}
                                </Typography>
                            ) : (
                                text
                            )}

                            {label === "LPO Number" && !isEmpty && (
                                <Tooltip title="Copy to clipboard">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(text || '');
                                            toast.success('LPO Number copied to clipboard');
                                        }}
                                        sx={{
                                            ml: 1,
                                            color: alpha(PRIMARY_COLOR, 0.7),
                                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.1) }
                                        }}
                                    >
                                        <ContentPasteIcon fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    )}
                </Typography>
            </Box>
        </Paper>
    );
};

const InventoryDetails = () => {
    const { currentInventory } = useContext(InventoryContext);
    const { id } = useParams<{ id: string }>();
    const { fetchInventoryByID } = ViewInventoryutills();
    const [fileURL, setFileURL] = useState<string>("");
    const navigate = useNavigate();
    const theme = useTheme();
    const [loading, setLoading] = useState<boolean>(true);

    const {
        handleClose,
        open,
    } = InventoryUtills();

    useEffect(() => {
        setLoading(true);
        fetchInventoryByID(id as string).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (currentInventory?.id) {
            if (currentInventory.grnReports && currentInventory.grnReports.length > 0) {
                const report = currentInventory.grnReports[0];
                const filename = report.documentPath?.split('/').pop();
                const publicPath = `/statics/${filename}`;
                setFileURL(publicPath);
            }
        }
    }, [currentInventory?.id]);

    // Check if inventory data is available
    // const hasInventoryData = Boolean(currentInventory?.id);

    // Format status for display
    const getStatusChip = () => {
        const status = currentInventory?.status?.status;
        if (!status) return null;

        let color = 'default';
        let bgcolor = alpha('#757575', 0.08);
        let textColor = '#757575';

        switch (status.toLowerCase()) {
            case 'active':
            case 'stockcompleted':
                color = 'success';
                bgcolor = alpha('#2e7d32', 0.08);
                textColor = '#2e7d32';
                break;
            case 'stockpending':
                console.log("here");
                color = 'warning';
                bgcolor = alpha('#ed6c02', 0.08);
                textColor = '#ed6c02';
                break;
            case 'cancelled':
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                color = 'error';
                bgcolor = alpha('#d32f2f', 0.08);
                textColor = '#d32f2f';
                break;
        }

        return (
            <Chip
                label={camelCaseToWords(status)}
                size="small"
                sx={{
                    fontWeight: 600,
                    bgcolor: bgcolor,
                    color: textColor,
                    border: 'none'
                }}
            />
        );
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3, bgcolor: '#F3F7FB', borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}>
            {/* GRN Document Modal */}
            <ModalComponent
                title='View Goods Received Note'
                open={open}
                handleClose={handleClose}
                width="50%"
            >
                <iframe
                    src={fileURL}
                    title="PDF Preview"
                    width="100%"
                    style={{ border: 'none', minHeight: '600px', overflow: 'hidden' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <MuiButton
                        color="secondary"
                        variant="contained"
                        onClick={handleClose}
                    >
                        Close
                    </MuiButton>
                </Box>
            </ModalComponent>

            {loading ? (
                <Loading items='Inventory' />
            ) : (
                <>
                    {/* Navigation Row - Added at the top */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {/* <ArrowBackIcon
                                fontSize="small"
                                sx={{ mr: 0.5, opacity: 0.7 }}
                            /> */}
                            Inventory Details
                        </Typography>

                        <MuiButton
                            color='inherit'
                            type='button'
                            variant='outlined'
                            onClick={() => navigate(-1)}
                            startIcon={<ArrowBackIcon />}
                            size="small"
                            sx={{
                                borderColor: alpha('#000', 0.2),
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: alpha('#000', 0.3),
                                    backgroundColor: alpha('#000', 0.05)
                                }
                            }}
                        >
                            Back
                        </MuiButton>
                    </Box>
                    {/* Header Section */}
                    <Box
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: `0 1px 3px ${alpha('#000', 0.08)}`,
                            border: `1px solid ${alpha('#000', 0.08)}`,
                            bgcolor: '#ffffff'
                        }}
                    >
                        {/* Accent color bar at top */}
                        <Box sx={{ height: 4, bgcolor: PRIMARY_COLOR }} />

                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                {/* Left side - Inventory Identity */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                    <Box
                                        sx={{
                                            mr: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 1.5,
                                            background: `linear-gradient(135deg, ${alpha(PRIMARY_COLOR, 0.12)} 0%, ${alpha(PRIMARY_COLOR, 0.22)} 100%)`,
                                            color: PRIMARY_COLOR,
                                            width: 48,
                                            height: 48,
                                            flexShrink: 0,
                                            boxShadow: `0 2px 6px ${alpha(PRIMARY_COLOR, 0.15)}`
                                        }}
                                    >
                                        <InventoryOutlinedIcon fontSize="medium" />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight={600}
                                            color="text.primary"
                                            sx={{ lineHeight: 1.2, mb: 1 }}
                                        >
                                            {currentInventory?.name || "Inventory"}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Chip
                                                size="small"
                                                label={currentInventory?.supplier?.name || "Unknown Supplier"}
                                                sx={{
                                                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                                    color: PRIMARY_COLOR,
                                                    fontWeight: 500,
                                                    borderRadius: 1
                                                }}
                                            />

                                            {currentInventory?.status?.status && getStatusChip()}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Right side - Inventory Details */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        flexWrap: 'wrap',
                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* LPO Number */}
                                    {currentInventory?.lpoNumber && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                py: 0.75,
                                                px: 1.5,
                                                borderRadius: 1.5,
                                                bgcolor: alpha(SECONDARY_COLOR, 0.05),
                                                border: `1px solid ${alpha(SECONDARY_COLOR, 0.15)}`,
                                                minWidth: 'fit-content'
                                            }}
                                        >
                                            <ReceiptOutlinedIcon
                                                fontSize="small"
                                                sx={{
                                                    color: alpha(SECONDARY_COLOR, 0.7),
                                                    mr: 0.75
                                                }}
                                            />

                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500, display: 'block', mb: 0.2 }}
                                                >
                                                    LPO Number
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                        color={SECONDARY_COLOR}
                                                    >
                                                        {currentInventory?.lpoNumber}
                                                    </Typography>

                                                    <Tooltip title="Copy to clipboard">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(currentInventory?.lpoNumber || '');
                                                                toast.success('LPO Number copied to clipboard');
                                                            }}
                                                            sx={{
                                                                ml: 0.5,
                                                                p: 0.3,
                                                                color: alpha(SECONDARY_COLOR, 0.7),
                                                                '&:hover': {
                                                                    bgcolor: alpha(SECONDARY_COLOR, 0.1),
                                                                    color: SECONDARY_COLOR
                                                                }
                                                            }}
                                                        >
                                                            <ContentPasteIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Delivery Date */}
                                    {currentInventory?.createDate && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                py: 0.75,
                                                px: 1.5,
                                                borderRadius: 1.5,
                                                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                                border: `1px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                                                minWidth: 'fit-content'
                                            }}
                                        >
                                            <CalendarTodayOutlinedIcon
                                                fontSize="small"
                                                sx={{
                                                    color: alpha(PRIMARY_COLOR, 0.7),
                                                    mr: 0.75
                                                }}
                                            />

                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500, display: 'block', mb: 0.2 }}
                                                >
                                                    Delivery Date
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={PRIMARY_COLOR}
                                                >
                                                    {moment(currentInventory?.createDate).format('DD MMM YYYY')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Main Content Grid */}
                    <Grid container spacing={3}>
                        {/* Left Column - Inventory Info */}
                        <Grid item xs={12} md={4}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    height: '100%',
                                    bgcolor: '#ffffff'
                                }}
                            >
                                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Supplier header */}
                                    <Box sx={{
                                        p: 2.5,
                                        bgcolor: alpha(theme.palette.primary.light, 0.04),
                                        borderBottom: `1px solid ${alpha('#000', 0.08)}`
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <BusinessOutlinedIcon color="primary" />
                                            <Typography
                                                variant="subtitle1"
                                                color="primary"
                                                fontWeight={600}
                                            >
                                                Supplier Information
                                            </Typography>
                                        </Box>

                                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                                            {currentInventory?.supplier?.name || "No supplier information"}
                                        </Typography>
                                    </Box>

                                    {/* Inventory details */}
                                    <Box sx={{ p: 2.5, flex: 1 }}>
                                        <Stack spacing={2}>
                                            <EnhancedDetailSection
                                                label='Contact Number'
                                                icon={<LocalPhoneOutlinedIcon />}
                                                text={currentInventory?.supplier?.telephone as string}
                                            />

                                            <EnhancedDetailSection
                                                label='Email Address'
                                                icon={<EmailOutlinedIcon />}
                                                text={currentInventory?.supplier?.email || null}
                                            />

                                            <EnhancedDetailSection
                                                label='Address'
                                                icon={<LocationOnOutlinedIcon />}
                                                text={currentInventory?.supplier?.address || null}
                                            />

                                            <Divider sx={{ my: 0.5 }} />

                                            <EnhancedDetailSection
                                                label="LPO Number"
                                                icon={<ReceiptOutlinedIcon />}
                                                text={currentInventory?.lpoNumber || null}
                                            />

                                            <EnhancedDetailSection
                                                label="Delivery Date"
                                                icon={<CalendarTodayOutlinedIcon />}
                                                text={currentInventory?.createDate ? moment(currentInventory?.createDate).format('Do MMMM YYYY, h:mm') : null}
                                            />
                                        </Stack>
                                    </Box>

                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right Column - Tabs */}
                        <Grid item xs={12} md={8}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    height: '100%',
                                    bgcolor: '#ffffff'
                                }}
                            >
                                <CardContent sx={{ p: 0 }}>
                                    <TabComponent
                                        headers={[
                                            {
                                                label: "Stock Commodities",
                                                position: 0,
                                                content: <OtherDetails inventory={currentInventory} />
                                            },
                                            {
                                                label: "Goods Received Notes (GRN)",
                                                position: 1,
                                                content: <InventoryPRN grnList={currentInventory.grnReports as Array<IGRNReport>} />
                                            }
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default InventoryDetails;