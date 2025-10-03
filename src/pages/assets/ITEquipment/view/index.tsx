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
import { IITEquipment, IITEquipmentAxiosResponse } from '../interface';
import {
    getITEquipmentByIDService,
    removeITEquipmentImageService,
    updateITEquipmentImageService
} from '../service';
import Loading from '../../../../components/loading';
import moment from 'moment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import { camelCaseToWords } from '../../../../utils/helpers';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CableIcon from '@mui/icons-material/Cable';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

// Ensure we import the TimeLineDot component
import TimeLineDot from "../../../../components/timeLineDots";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { toast } from 'react-toastify';
import AssetImageUpload from './AssetImageUpload';
import { IAssetAxiosResponse } from '../../interface';
import { ROUTES } from '../../../../core/routes/routes';
import { assetTypesStatusConstants, crudStates } from '../../../../utils/constants';
import ModalComponent from '../../../../components/modal';
import Reassign from '../../Reassign';
import ITEquipmentUtills from '../utills';

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
                            {label === "Status" && text && <Box sx={{ mr: 1 }}><TimeLineDot status={text} /></Box>}

                            {isEmpty ? (
                                <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                    {emptyMessage}
                                </Typography>
                            ) : (
                                camelCaseToWords(text || '')
                            )}

                            {label === "Engraved Number" && !isEmpty && (
                                <Tooltip title="Copy to clipboard">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(text || '');
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


const ITEquipmentDetails = () => {
    const [equipment, setEquipment] = useState<IITEquipment>({} as IITEquipment);
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { handleOptionClicked, open, handleClose, currentState } = ITEquipmentUtills();

    const getITEquipment = async () => {
        setLoading(true);
        try {
            const response = await getITEquipmentByIDService(id as string) as IITEquipmentAxiosResponse;
            if (response.status === 200) {
                setEquipment(response.data);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    useEffect(() => { getITEquipment(); }, []);


    // Add these new functions for handling image updates
    const handleImageUpdate = async (file: File) => {
        try {
            // Create FormData for API
            const formData = new FormData();
            formData.append('file', file);

            // You'll need to create this service function
            const response = await updateITEquipmentImageService(id as string, formData) as IAssetAxiosResponse;
            if (response.status !== 201) {
                toast.error('Failed to update image');
            }

            if (response.data && response.data.image) {
                const serverPath = response.data.image;
                const filename = serverPath.split(/[\/\\]/).pop();

                setEquipment({
                    ...equipment,
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
            const response = await removeITEquipmentImageService(id as string) as IAssetAxiosResponse;
            if (response.status !== 201) {
                toast.error('Failed to update image');
            }

            if (response.data) {
                setEquipment({
                    ...equipment,
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
                <Loading items='IT Asset' />
            ) : (
                <>
                    {
                        crudStates.reassign === currentState
                        && <ModalComponent width={"40%"} title='Reassign IT Equipment' open={open} handleClose={handleClose}>
                            <Reassign
                                handleClickAction={handleOptionClicked}
                                sendingRequest={loading}
                                handleClose={handleClose}
                                buttonText='Confirm'
                                asset={equipment}
                                module={assetTypesStatusConstants.itEquipment}
                            />
                        </ModalComponent>
                    }
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: 2,
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
                            IT Equipment Details
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            <MuiButton
                                color='primary'
                                type='button'
                                onClick={() => navigate(`${ROUTES.UPDATE_ITEQUIPMENT}/${equipment.id}`)}
                                variant='outlined'
                                startIcon={<EditIcon />}
                            >Edit</MuiButton>

                            {
                                // equipment?.assignedTo === null && 
                                equipment?.assetStatus?.status === 'inStore' && (
                                    <MuiButton
                                        color='success'
                                        type='button'
                                        variant='contained'
                                        onClick={() => handleOptionClicked(crudStates.reassign)}
                                        startIcon={<AssignmentIndIcon />}
                                    >Assign</MuiButton>
                                )}

                            <MuiButton
                                color='inherit'
                                type='button'
                                variant='outlined'
                                onClick={() => navigate(ROUTES.LIST_ASSETS)}
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
                                {/* Left side - Asset Identity */}
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
                                        <DevicesOtherIcon fontSize="medium" />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight={600}
                                            color="text.primary"
                                            sx={{ lineHeight: 1.2, mb: 1 }}
                                        >
                                            {equipment.assetName || "IT Equipment"}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Chip
                                                size="small"
                                                label={equipment.assetType?.name || "IT Equipment"}
                                                sx={{
                                                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                                    color: PRIMARY_COLOR,
                                                    fontWeight: 500,
                                                    borderRadius: 1
                                                }}
                                            />

                                            {equipment.assetStatus?.status && (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <TimeLineDot status={equipment.assetStatus.status} />
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={500}
                                                        color="text.secondary"
                                                        sx={{ ml: 0.5 }}
                                                    >
                                                        {equipment.assetStatus.status}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Right side - Asset Details */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        flexWrap: 'wrap',
                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Engraved Number */}
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
                                                Engraved No #
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={equipment.engravedNumber ? 600 : 400}
                                                    color={equipment.engravedNumber ? SECONDARY_COLOR : 'text.secondary'}
                                                    sx={{
                                                        fontStyle: equipment.engravedNumber ? 'normal' : 'italic'
                                                    }}
                                                >
                                                    {equipment.engravedNumber || "Not specified"}
                                                </Typography>

                                                {equipment.engravedNumber && (
                                                    <Tooltip title="Copy to clipboard">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(equipment.engravedNumber || '');
                                                                toast.success('Asset # copied to clipboard');
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

                                    {/* Location */}
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
                                                fontWeight={equipment.branch?.name ? 600 : 400}
                                                color={equipment.branch?.name ? PRIMARY_COLOR : 'text.secondary'}
                                                sx={{
                                                    fontStyle: equipment.branch?.name ? 'normal' : 'italic'
                                                }}
                                            >
                                                {equipment.branch?.name || "Not specified"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Grid container spacing={3} >
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
                                    currentImage={equipment.image as string}
                                    assetName={equipment.assetName || "IT Equipment"}
                                    assetType={equipment.assetType?.name || "IT Equipment"}
                                    onImageUpdate={handleImageUpdate}
                                    onImageRemove={handleImageRemove}
                                    readOnly={!equipment.id}
                                    height={220}
                                />

                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="text.secondary"
                                        >
                                            Basic Information
                                        </Typography>
                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                    </Box>

                                    <EnhancedDetailSection
                                        label="Hostname"
                                        text={equipment?.hostname as string || null}
                                        icon={<CableIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Model"
                                        text={equipment?.model as string || null}
                                        icon={<DevicesOtherIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Engraved Number"
                                        text={equipment?.engravedNumber as string || null}
                                        icon={<InfoIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Supplier"
                                        text={equipment.supplier?.name || null}
                                        icon={<AccountBalanceIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Purchase Cost"
                                        text={equipment.purchaseCost}
                                        icon={<PaidIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Date of Receipt"
                                        text={equipment.dateReceipt ? moment(equipment.dateReceipt).format('Do MMMM YYYY') : null}
                                        icon={<CalendarTodayIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Location"
                                        text={equipment.branch?.name || null}
                                        icon={<LocationOnIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Status"
                                        text={equipment.assetStatus?.status as string || null}
                                        icon={<InventoryIcon fontSize="small" />}
                                    />

                                    {equipment.description && (
                                        <EnhancedDetailSection
                                            label="Description"
                                            text={equipment.description}
                                            icon={<DescriptionIcon fontSize="small" />}
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
                                                        <AssignmentHistory id={equipment?.id?.toString() || ""} />
                                                    </Box>
                                                )
                                            },
                                            {
                                                label: "Repair History",
                                                position: 1,
                                                content: (
                                                    <Box>
                                                        <RepairHistory id={equipment?.id?.toString() || ""} />
                                                    </Box>
                                                )
                                            },
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

export default ITEquipmentDetails;