/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Stack,
    Typography,
    Paper,
    alpha,
    Container,
    Button as MuiButton,
    Tooltip,
    IconButton
} from "@mui/material";
import { fleetsMock } from "../../../../mocks/fleet";
import { useState, useEffect } from "react";
import TabComponent from "../../../../components/tabs";
import AssignmentHistory from "../../trails/AssignmentHistory";
import RepairHistory from "../../trails/RepairHistory";
import moment from 'moment';
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../../components/loading";
import { camelCaseToWords } from "../../../../utils/helpers";
import { toast } from "react-toastify";
import TimeLineDot from "../../../../components/timeLineDots";
import AssetImageUpload from "../../../assets/ITEquipment/view/AssetImageUpload";

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CommuteIcon from '@mui/icons-material/Commute';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import StyleIcon from '@mui/icons-material/Style';
import ColorLensIcon from '@mui/icons-material/ColorLens';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Enhanced DetailSection component with icons and better styling
const EnhancedDetailSection = ({
    label,
    text,
    icon,
    chip,
    emptyMessage = "Not specified"
}: {
    label: string;
    text: string | null | undefined;
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
                            {label.toLowerCase().includes('status') && text &&
                                <Box sx={{ mr: 1 }}><TimeLineDot status={text} /></Box>
                            }

                            {isEmpty ? (
                                <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                    {emptyMessage}
                                </Typography>
                            ) : (
                                typeof text === 'string' ? camelCaseToWords(text) : text
                            )}

                            {(label.toLowerCase().includes('registration') ||
                                label.toLowerCase().includes('license') ||
                                label.toLowerCase().includes('chassis')) &&
                                !isEmpty && (
                                    <Tooltip title="Copy to clipboard">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                navigator.clipboard.writeText(text?.toString() || '');
                                                toast.info(`${label} copied to clipboard`);
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

                            {label.toLowerCase().includes('cost') && !isEmpty && (
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{
                                        ml: 0.5,
                                        bgcolor: alpha(SECONDARY_COLOR, 0.1),
                                        color: SECONDARY_COLOR,
                                        p: 0.5,
                                        px: 1,
                                        borderRadius: 1,
                                        fontWeight: 500
                                    }}
                                >
                                    UGX
                                </Typography>
                            )}
                        </Box>
                    )}
                </Typography>
            </Box>
        </Paper>
    );
};

const FleetDetails = () => {
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [uploadLoading, setUploadLoading] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Simulated data fetch (would be replaced with an actual API call)
    useEffect(() => {
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            // Find the vehicle by ID or use the first mock vehicle
            const foundVehicle = id ?
                fleetsMock.find(v => (v.id as number).toString() === id) : fleetsMock[0];

            setVehicle(foundVehicle);
            setLoading(false);
        }, 800);
    }, [id]);

    // Image handling functions
    const handleImageUpdate = async (file: File) => {
        try {
            // Show loading state
            setUploadLoading(true);

            // Create FormData for API (for future implementation)
            const formData = new FormData();
            formData.append('image', file);
            formData.append('id', id as string);

            // In a real implementation, you would call an API here
            // const response = await updateVehicleImageService(formData);

            // Simulate API call delay
            setTimeout(() => {
                const imageUrl = URL.createObjectURL(file);
                setVehicle((prev: any) => ({
                    ...prev,
                    image: imageUrl
                }));
                toast.success('Vehicle image updated successfully');
                setUploadLoading(false);
            }, 1500);
        } catch (error) {
            console.error('Error updating image:', error);
            toast.error('Failed to update vehicle image');
            setUploadLoading(false);
        }
    };

    const handleImageRemove = async () => {
        try {
            setUploadLoading(true);

            // In a real implementation, call an API to remove the image
            // const response = await removeVehicleImageService(id as string);

            // Simulate API call
            setTimeout(() => {
                setVehicle((prev: any) => ({
                    ...prev,
                    image: null
                }));
                toast.success('Vehicle image removed successfully');
                setUploadLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove vehicle image');
            setUploadLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3, bgcolor: '#F3F7FB', borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}>
            {loading ? (
                <Loading items='Fleet Vehicle' />
            ) : (
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    height: '100%'
                                }}
                            >
                                {/* Improved AssetImageUpload implementation */}
                                <AssetImageUpload
                                    currentImage={vehicle?.image || null}
                                    assetName={vehicle?.assetName || "Vehicle"}
                                    assetType="Fleet"
                                    onImageUpdate={handleImageUpdate}
                                    onImageRemove={handleImageRemove}
                                    readOnly={!vehicle?.id}
                                    height={220}
                                />

                                <CardContent>
                                    {/* Basic Information Section */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="text.secondary"
                                        >
                                            Vehicle Information
                                        </Typography>
                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                    </Box>

                                    <EnhancedDetailSection
                                        label="Vehicle Name"
                                        text={vehicle?.assetName}
                                        icon={<DirectionsCarIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Make/Model"
                                        text={vehicle?.make || vehicle?.model ? `${vehicle?.make || ''} ${vehicle?.model || ''}`.trim() : null}
                                        icon={<CommuteIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Registration Number"
                                        text={vehicle?.serialNumber || vehicle?.engravedNumber}
                                        icon={<StyleIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Color"
                                        text={vehicle?.color || null}
                                        icon={<ColorLensIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Chassis Number"
                                        text={vehicle?.chassisNumber || null}
                                        icon={<InfoIcon fontSize="small" />}
                                    />

                                    {/* Supplier & Financial Section */}
                                    <Box sx={{ mb: 2, mt: 3 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="text.secondary"
                                        >
                                            Purchase & Assignment
                                        </Typography>
                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                    </Box>

                                    <EnhancedDetailSection
                                        label="Supplier"
                                        text={vehicle?.supplier?.name || null}
                                        icon={<AccountBalanceIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Purchase Cost"
                                        text={vehicle?.purchaseCost}
                                        icon={<PaidIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Date of Receipt"
                                        text={vehicle?.dateReceipt ? moment(vehicle.dateReceipt).format('Do MMMM YYYY') : null}
                                        icon={<CalendarTodayIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Location"
                                        text={vehicle?.branch?.name || null}
                                        icon={<LocationOnIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Status"
                                        text={vehicle?.assetStatus?.status || vehicle?.assetStatus?.name || null}
                                        icon={<InventoryIcon fontSize="small" />}
                                    />

                                    {/* Technical Details Section */}
                                    <Box sx={{ mb: 2, mt: 3 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="text.secondary"
                                        >
                                            Technical Specifications
                                        </Typography>
                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                    </Box>

                                    <EnhancedDetailSection
                                        label="Engine Capacity"
                                        text={vehicle?.engineCapacity || null}
                                        icon={<SpeedIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Fuel Type"
                                        text={vehicle?.fuelType || null}
                                        icon={<LocalGasStationIcon fontSize="small" />}
                                    />

                                    {vehicle?.description && (
                                        <EnhancedDetailSection
                                            label="Description"
                                            text={vehicle.description}
                                            icon={<DescriptionIcon fontSize="small" />}
                                        />
                                    )}

                                    {vehicle?.assignedTo && (
                                        <EnhancedDetailSection
                                            label="Assigned To"
                                            text={`${vehicle.assignedTo.firstName} ${vehicle.assignedTo.lastName}`}
                                            icon={<AssignmentIndIcon fontSize="small" />}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    height: '100%'
                                }}
                            >
                                <CardContent>
                                    <TabComponent
                                        headers={[
                                            {
                                                label: "Assignment History",
                                                position: 0,
                                                content: (
                                                    <Box>
                                                        <AssignmentHistory id={vehicle?.id?.toString() || ""} />
                                                    </Box>
                                                )
                                            },
                                            {
                                                label: "Repair & Maintenance",
                                                position: 1,
                                                content: (
                                                    <Box>
                                                        <RepairHistory id={vehicle?.id?.toString() || ""} />
                                                    </Box>
                                                )
                                            },
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: 2,
                            mt: 3,
                        }}
                    >
                        <Stack
                            direction="row"
                            sx={{
                                width: '100%',
                                display: 'flex'
                            }}>
                            <MuiButton
                                color='inherit'
                                type='button'
                                variant='outlined'
                                onClick={() => navigate(-1)}
                                startIcon={<ArrowBackIcon />}
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
                            <Stack direction="row"
                                sx={{
                                    ml: 'auto',
                                }}
                                spacing={1.5}>
                                <MuiButton
                                    color='primary'
                                    type='button'
                                    onClick={() => navigate(`/assets/fleet/edit/${vehicle.id}`)}
                                    variant='outlined'
                                    startIcon={<EditIcon />}
                                >
                                    Edit
                                </MuiButton>

                                {!vehicle?.assignedTo && (
                                    <MuiButton
                                        color='success'
                                        type='button'
                                        variant='contained'
                                        onClick={() => navigate(`/assets/fleet/assign/${vehicle.id}`)}
                                        startIcon={<AssignmentIndIcon />}
                                    >
                                        Assign
                                    </MuiButton>
                                )}
                            </Stack>
                        </Stack>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default FleetDetails;