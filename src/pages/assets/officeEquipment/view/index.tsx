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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TabComponent from '../../../../components/tabs';
import AssignmentHistory from '../../trails/AssignmentHistory';
import RepairHistory from '../../trails/RepairHistory';
import { useEffect, useState } from 'react';
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse } from "../interface";
import { getOfficeEquipmentByIDService } from "../service";
import Loading from '../../../../components/loading';
import moment from 'moment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { camelCaseToWords } from '../../../../utils/helpers';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { toast } from 'react-toastify';

// Ensure we import the TimeLineDot component
import TimeLineDot from "../../../../components/timeLineDots";
import AssetImageUpload from '../../../assets/ITEquipment/view/AssetImageUpload';

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

                            {label === "Serial Number" && !isEmpty && (
                                <Tooltip title="Copy to clipboard">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(text || '');
                                            toast.info('Serial number copied to clipboard');
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

const OfficeEquipmentDetails = () => {
    const [equipment, setEquipment] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const getOfficeEquipment = async () => {
        setLoading(true);
        try {
            const response = await getOfficeEquipmentByIDService(id as string) as IOfficeEquipmentAxiosResponse;
            if (response.status === 200) {
                setEquipment(response.data);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    useEffect(() => { getOfficeEquipment(); }, []);

    // Add these new functions for handling image updates
    const handleImageUpdate = async (file: File) => {
        try {
            // Create FormData for API
            const formData = new FormData();
            formData.append('image', file);
            formData.append('id', id as string);

            // You'll need to create this service function
            // const response = await updateOfficeEquipmentImageService(formData);

            // For now, we'll mock a successful update
            setTimeout(() => {
                // Create an object URL for preview (temporary)
                const imageUrl = URL.createObjectURL(file);
                setEquipment({
                    ...equipment,
                    image: imageUrl
                });
                toast.success('Image updated successfully');
            }, 1500);

        } catch (error) {
            console.error('Error updating image:', error);
            toast.error('Failed to update image');
        }
    };

    const handleImageRemove = async () => {
        try {
            // In a real implementation, call an API to remove the image
            // const response = await removeOfficeEquipmentImageService(id as string);

            // For now, we'll mock a successful removal
            setTimeout(() => {
                setEquipment({
                    ...equipment,
                    image: null
                });
                toast.success('Image removed successfully');
            }, 1000);

        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3, bgcolor: '#F3F7FB', borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}>
            {loading ? (
                <Loading items='Office Asset' />
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
                                <AssetImageUpload
                                    currentImage={equipment.image as string}
                                    assetName={equipment.assetName || "Office Equipment"}
                                    assetType={equipment.assetType?.name || "Office Equipment"}
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
                                        label="Asset Name"
                                        text={equipment.assetName}
                                        icon={<TableRestaurantIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Asset Type"
                                        text={equipment.assetType?.name || null}
                                        icon={<MoveToInboxIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Engraved Number"
                                        text={equipment.engravedNumber || null}
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
                                        text={equipment.assetStatus?.status || equipment.assetStatus?.name || null}
                                        icon={<InventoryIcon fontSize="small" />}
                                    />

                                    {equipment.description && (
                                        <EnhancedDetailSection
                                            label="Description"
                                            text={equipment.description}
                                            icon={<DescriptionIcon fontSize="small" />}
                                        />
                                    )}

                                    {equipment.assignedTo && (
                                        <EnhancedDetailSection
                                            label="Assigned To"
                                            text={`${equipment.assignedTo.firstName} ${equipment.assignedTo.lastName}`}
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
                                    onClick={() => navigate(`/assets/office-equipment/edit/${equipment.id}`)}
                                    variant='outlined'

                                    startIcon={<EditIcon />}
                                >
                                    Edit
                                </MuiButton>

                                {equipment.assignedTo === null && (
                                    <MuiButton
                                        color='success'
                                        type='button'
                                        variant='contained'
                                        onClick={() => navigate(`/assets/office-equipment/assign/${equipment.id}`)}
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

export default OfficeEquipmentDetails;