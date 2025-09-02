/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Divider,
    Stack,
    alpha,
    Paper,
    IconButton,
    Tooltip,
    Container,
    Button as MuiButton,
    Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TabComponent from '../../../../components/tabs';
import AssignmentHistory from '../../trails/AssignmentHistory';
import RepairHistory from '../../trails/RepairHistory';
import { useEffect, useState } from 'react';
import Loading from '../../../../components/loading';
import moment from 'moment';
import { camelCaseToWords } from '../../../../utils/helpers';
import { toast } from 'react-toastify';
import TimeLineDot from '../../../../components/timeLineDots';
import AssetImageUpload from '../../../assets/ITEquipment/view/AssetImageUpload';

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
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import StyleIcon from '@mui/icons-material/Style';
import { IFleet, IFleetAxiosResponse } from '../interface';
import { getFleetByIDService, removeFleetImageService, updateFleetImageService } from '../service';
import { IAssetAxiosResponse } from '../../interface';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Custom styled DetailSection with improved appearance
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
                            {label === "Status" && text && <Box sx={{ mr: 1 }}><TimeLineDot status={text} /></Box>}

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
                                                toast.success(`${label} copied to clipboard`);
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

                            {label === "Purchase Cost" && !isEmpty && (
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
    const [fleet, setFleet] = useState<IFleet>({} as IFleet);
    const [loading, setLoading] = useState<boolean>(true);
    const [uploadLoading, setUploadLoading] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const getFleet = async () => {
        setLoading(true);
        try {
            const response = await getFleetByIDService(id as string) as IFleetAxiosResponse;
            if (response.status === 200) {
                setFleet(response.data);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    useEffect(() => { getFleet(); }, []);

    const handleImageUpdate = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await updateFleetImageService(id as string, formData) as IAssetAxiosResponse;
            if (response.status !== 201) {
                toast.error('Failed to update image');
            }

            if (response.data && response.data.image) {
                const serverPath = response.data.image;
                const filename = serverPath.split(/[\/\\]/).pop();

                setFleet({
                    ...fleet,
                    image: `/statics/${filename}`
                });

                toast.success('Image updated successfully');
            }
        } catch (error) {
            console.error('Error updating image:', error);
            toast.error('Failed to update image');
        }
    };

    const handleImageRemove = async () => {
        try {
            const response = await removeFleetImageService(id as string) as IAssetAxiosResponse;
            if (response.status !== 201) {
                toast.error('Failed to update image');
            }

            if (response.data) {
                setFleet({
                    ...fleet,
                    image: null
                });

                toast.success('Image removed successfully');
            }

        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3, bgcolor: '#F3F7FB', borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}>
            {loading ? (
                <Loading items='Fleet Vehicle' />
            ) : (
                <>
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
                        <Box sx={{ height: 4, bgcolor: PRIMARY_COLOR }} />

                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
                                        <DirectionsCarIcon fontSize="medium" />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight={600}
                                            color="text.primary"
                                            sx={{ lineHeight: 1.2, mb: 1 }}
                                        >
                                            {fleet?.assetName || "Fleet Vehicle"}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Chip
                                                size="small"
                                                label={fleet?.assetType?.name || "Fleet"}
                                                sx={{
                                                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                                    color: PRIMARY_COLOR,
                                                    fontWeight: 500,
                                                    borderRadius: 1
                                                }}
                                            />

                                            {fleet?.assetStatus?.status && (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <TimeLineDot status={fleet?.assetStatus.status} />
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={500}
                                                        color="text.secondary"
                                                        sx={{ ml: 0.5 }}
                                                    >
                                                        {fleet?.assetStatus?.status}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        flexWrap: 'wrap',
                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                        alignItems: 'center'
                                    }}
                                >
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
                                        <InfoIcon
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
                                                Registration No #
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={fleet?.engravedNumber ? 600 : 400}
                                                    color={fleet?.engravedNumber ? SECONDARY_COLOR : 'text.secondary'}
                                                    sx={{
                                                        fontStyle: fleet?.engravedNumber ? 'normal' : 'italic'
                                                    }}
                                                >
                                                    {fleet?.engravedNumber || "Not specified"}
                                                </Typography>

                                                {fleet?.engravedNumber && (
                                                    <Tooltip title="Copy to clipboard">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(fleet?.engravedNumber || '');
                                                                toast.success('Registration # copied to clipboard');
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
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

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
                                        <LocationOnIcon
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
                                                Location
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                fontWeight={fleet?.branch?.name ? 600 : 400}
                                                color={fleet?.branch?.name ? PRIMARY_COLOR : 'text.secondary'}
                                                sx={{
                                                    fontStyle: fleet?.branch?.name ? 'normal' : 'italic'
                                                }}
                                            >
                                                {fleet?.branch?.name || "Not specified"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

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
                                <AssetImageUpload
                                    currentImage={fleet?.image as string}
                                    assetName={fleet?.assetName || "Fleet Vehicle"}
                                    assetType={fleet?.assetType?.name || "Fleet"}
                                    onImageUpdate={handleImageUpdate}
                                    onImageRemove={handleImageRemove}
                                    readOnly={!fleet?.id}
                                    height={220}
                                />

                                <CardContent>
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
                                        text={fleet?.assetName}
                                        icon={<DirectionsCarIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Make/Model"
                                        text={fleet?.make || fleet?.model ? `${fleet?.make || ''} ${fleet?.model || ''}`.trim() : null}
                                        icon={<CommuteIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Registration Number"
                                        text={fleet?.engravedNumber || fleet?.engravedNumber}
                                        icon={<StyleIcon fontSize="small" />}
                                    />

                                    {/* <EnhancedDetailSection
                                        label="Color"
                                        text={fleet?.color || null}
                                        icon={<ColorLensIcon fontSize="small" />}
                                    /> */}

                                    <EnhancedDetailSection
                                        label="Chassis Number"
                                        text={fleet?.engravedNumber || null}
                                        icon={<InfoIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Supplier"
                                        text={fleet?.supplier?.name || null}
                                        icon={<AccountBalanceIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Purchase Cost"
                                        text={fleet?.purchaseCost}
                                        icon={<PaidIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Date of Receipt"
                                        text={fleet?.dateReceipt ? moment(fleet.dateReceipt).format('Do MMMM YYYY') : null}
                                        icon={<CalendarTodayIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Engine Capacity"
                                        text={fleet?.category || null}
                                        icon={<SpeedIcon fontSize="small" />}
                                    />

                                    {/* <EnhancedDetailSection
                                        label="Fuel Type"
                                        text={fleet?.fuelType || null}
                                        icon={<LocalGasStationIcon fontSize="small" />}
                                    /> */}

                                    <EnhancedDetailSection
                                        label="Location"
                                        text={fleet?.branch?.name || null}
                                        icon={<LocationOnIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Status"
                                        text={fleet?.assetStatus?.status || fleet?.assetStatus?.name || null}
                                        icon={<InventoryIcon fontSize="small" />}
                                    />

                                    {fleet?.description && (
                                        <EnhancedDetailSection
                                            label="Description"
                                            text={fleet?.description}
                                            icon={<DescriptionIcon fontSize="small" />}
                                        />
                                    )}

                                    {fleet?.assignedTo && (
                                        <EnhancedDetailSection
                                            label="Assigned To"
                                            text={`${fleet?.assignedTo.firstName} ${fleet?.assignedTo.lastName}`}
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
                                                        <AssignmentHistory id={fleet?.id?.toString() || ""} />
                                                    </Box>
                                                )
                                            },
                                            {
                                                label: "Repair & Maintenance",
                                                position: 1,
                                                content: (
                                                    <Box>
                                                        <RepairHistory id={fleet?.id?.toString() || ""} />
                                                    </Box>
                                                )
                                            },
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Updated button section to match Office Equipment component */}
                    <Box
                        sx={{
                            mb: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'end',
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: 2,
                            mt: 3,
                        }}
                    >
                        <Stack direction="row" spacing={1.5}>
                            <MuiButton
                                color='primary'
                                type='button'
                                onClick={() => navigate(`/assets/fleet/edit/${fleet?.id}`)}
                                variant='outlined'
                                startIcon={<EditIcon />}
                            >Edit</MuiButton>

                            {fleet?.assignedTo === null && (
                                <MuiButton
                                    color='success'
                                    type='button'
                                    variant='contained'
                                    onClick={() => navigate(`/assets/fleet/assign/${fleet?.id}`)}
                                    startIcon={<AssignmentIndIcon />}
                                >Assign</MuiButton>
                            )}

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
                            >Back</MuiButton>
                        </Stack>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default FleetDetails;