import {
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
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
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse } from '../../interface';
import {
    getOfficeEquipmentByIDService,
    removeOfficeEquipmentImageService,
    updateOfficeEquipmentImageService
} from '../service';
import Loading from '../../../../components/loading';
import moment from 'moment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { camelCaseToWords } from '../../../../utils/helpers';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { toast } from 'react-toastify';
import TimeLineDot from '../../../../components/timeLineDots';
import AssetImageUpload from './AssetImageUpload';
import { IAssetAxiosResponse } from '../../interface';
import { ROUTES } from '../../../../core/routes/routes';
import { crudStates } from '../../../../utils/constants';
import ModalComponent from '../../../../components/modal';
import Reassign from '../../Reassign';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const DetailItem = ({ label, text, icon }: { label: string; text: string | null; icon?: JSX.Element }) => {
    const isEmpty = text === null || text === undefined || text === '';
    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex', alignItems: 'flex-start', p: 1.8, mb: 1.5,
                borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.06)}`,
                transition: 'all 0.2s',
                '&:hover': { borderColor: alpha(PRIMARY_COLOR, 0.3), boxShadow: `0 2px 8px ${alpha('#000', 0.05)}` }
            }}
        >
            {icon && (
                <Box sx={{
                    mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 1, bgcolor: alpha(PRIMARY_COLOR, 0.08), color: PRIMARY_COLOR,
                    width: 34, height: 34, flexShrink: 0
                }}>
                    {icon}
                </Box>
            )}
            <Box sx={{ width: '100%' }}>
                <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: isEmpty ? 400 : 500, color: isEmpty ? 'text.disabled' : 'text.primary' }}>
                    {label === 'Engraved Number' && !isEmpty ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {text}
                            <Tooltip title="Copy to clipboard">
                                <IconButton size="small" onClick={() => { navigator.clipboard.writeText(text || ''); toast.success('Copied!'); }}
                                    sx={{ ml: 1, color: alpha(PRIMARY_COLOR, 0.7) }}>
                                    <ContentPasteIcon fontSize='small' />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : label === 'Purchase Cost' && !isEmpty ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {text}
                            <Typography component="span" variant="caption" sx={{ bgcolor: alpha(SECONDARY_COLOR, 0.1), color: SECONDARY_COLOR, p: 0.5, px: 1, borderRadius: 1, fontWeight: 500 }}>UGX</Typography>
                        </Box>
                    ) : isEmpty ? (
                        <Typography variant="body2" fontStyle="italic" color="text.disabled">Not specified</Typography>
                    ) : (
                        camelCaseToWords(text || '')
                    )}
                </Typography>
            </Box>
        </Paper>
    );
};

const GeneralAssetDetails = () => {
    const [asset, setAsset] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const { typeId, id } = useParams<{ typeId: string; id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [currentState, setCurrentState] = useState<string>('');
    const navigate = useNavigate();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const assetType = assetTypes.find(t => String(t.id) === typeId);

    const fetchAsset = async () => {
        setLoading(true);
        try {
            const response = await getOfficeEquipmentByIDService(id as string) as IOfficeEquipmentAxiosResponse;
            if (response.status === 200) {
                setAsset(response.data);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAsset(); }, []);

    const handleImageUpdate = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await updateOfficeEquipmentImageService(id as string, formData) as IAssetAxiosResponse;
            if (response.status === 201 && response.data?.image) {
                const filename = response.data.image.split(/[/\\]/).pop();
                setAsset({ ...asset, image: `/statics/${filename}` });
                toast.success('Image updated successfully');
            } else {
                toast.error('Failed to update image');
            }
        } catch (error) {
            toast.error('Failed to update image');
        }
    };

    const handleImageRemove = async () => {
        try {
            const response = await removeOfficeEquipmentImageService(id as string) as IAssetAxiosResponse;
            if (response.status === 201) {
                setAsset({ ...asset, image: null });
                toast.success('Image removed');
            } else {
                toast.error('Failed to remove image');
            }
        } catch (error) {
            toast.error('Failed to remove image');
        }
    };

    const tabs = [
        { label: 'Details', position: 0, content: (
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <DetailItem label="Asset Name" text={asset.assetName || null} />
                    <DetailItem label="Engraved Number" text={asset.engravedNumber || null} />
                    <DetailItem label="Make / Model" text={asset.make || null} />
                    <DetailItem label="Hostname" text={asset.hostname || null} />
                    <DetailItem label="Unit of Measure" text={asset.unitOfMeasure || null} />
                    <DetailItem label="LPO Number" text={asset.stock?.lpoNumber || null} />
                    <DetailItem label="Date Received" text={asset.dateReceipt ? moment(asset.dateReceipt).format('Do MMMM YYYY') : null} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DetailItem label="Asset Type" text={asset.assetType?.name || null} />
                    <DetailItem label="Status" text={asset.assetStatus?.status ? camelCaseToWords(asset.assetStatus.status) : null} />
                    <DetailItem label="Branch / Location" text={asset.branch?.name || null} />
                    <DetailItem label="Assigned To" text={asset.assignedTo ? `${asset.assignedTo.lastName} ${asset.assignedTo.firstName}` : null} />
                    <DetailItem label="Purchase Cost" text={asset.purchaseCost?.toString() || null} />
                    <DetailItem label="Net Book Value" text={asset.netValueB?.toString() || null} />
                    <DetailItem label="Depreciation Rate" text={asset.assetDepreciationRate?.toString() || null} />
                </Grid>
            </Grid>
        )},
        { label: 'Assignment History', position: 1, content: <AssignmentHistory id={id as string} /> },
        { label: 'Repair History', position: 2, content: <RepairHistory id={id as string} /> },
    ];

    return (
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3, bgcolor: '#F5F8F7', borderRadius: 2, border: `1px solid ${alpha('#000', 0.07)}`, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            {loading ? (
                <Loading items={assetType?.name || 'Asset'} />
            ) : (
                <>
                    {currentState === crudStates.reassign && (
                        <ModalComponent width={"40%"} title={`Reassign ${assetType?.name || 'Asset'}`} open={open} handleClose={() => setOpen(false)}>
                            <Reassign
                                handleClickAction={() => setOpen(false)}
                                sendingRequest={loading}
                                handleClose={() => setOpen(false)}
                                buttonText='Confirm'
                                asset={asset}
                                module={assetType?.name || ''}
                            />
                        </ModalComponent>
                    )}

                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5, pb: 2, borderBottom: `1px solid ${alpha('#000', 0.06)}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: alpha(PRIMARY_COLOR, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CategoryOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={700} sx={{ color: PRIMARY_COLOR, lineHeight: 1.2 }}>
                                    {assetType?.name || 'Asset'} Details
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Asset record and management history</Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.5}>
                            <MuiButton color='primary' variant='outlined' startIcon={<EditIcon />}
                                onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/update/${asset.id}`)}>
                                Edit
                            </MuiButton>
                            {asset?.assetStatus?.status === 'inStore' && (
                                <MuiButton color='success' variant='contained' startIcon={<AssignmentIndIcon />}
                                    onClick={() => { setCurrentState(crudStates.reassign); setOpen(true); }}>
                                    Assign
                                </MuiButton>
                            )}
                            <MuiButton color='inherit' variant='outlined' startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}`)}>
                                Back
                            </MuiButton>
                        </Stack>
                    </Box>

                    {/* Asset title card */}
                    <Card elevation={0} sx={{ mb: 3, border: `1px solid ${alpha('#000', 0.08)}`, borderTop: `4px solid ${PRIMARY_COLOR}` }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2, mb: 1 }}>
                                        {asset.assetName || assetType?.name || 'Asset'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Chip size="small" label={asset.assetType?.name || assetType?.name || 'Asset'}
                                            sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.08), color: PRIMARY_COLOR, fontWeight: 500, borderRadius: 1 }} />
                                        {asset.assetStatus?.status && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeLineDot status={asset.assetStatus.status} />
                                                <Typography variant="body2" fontWeight={500} color="text.secondary">
                                                    {camelCaseToWords(asset.assetStatus.status)}
                                                </Typography>
                                            </Box>
                                        )}
                                        {asset.engravedNumber && (
                                            <Chip size="small" label={`#${asset.engravedNumber}`}
                                                sx={{ bgcolor: alpha('#000', 0.05), fontWeight: 500, borderRadius: 1 }} />
                                        )}
                                    </Box>
                                </Box>
                                <AssetImageUpload
                                    currentImage={asset.image || null}
                                    assetName={asset.assetName || ''}
                                    assetType={asset.assetType?.name || ''}
                                    onImageUpdate={handleImageUpdate}
                                    onImageRemove={handleImageRemove}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <TabComponent headers={tabs} />
                </>
            )}
        </Container>
    );
};

export default GeneralAssetDetails;
