import { useEffect, useState } from 'react';
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse } from '../interface';
import { useNavigate, useParams } from 'react-router';
import { officeEquipmentMock } from '../../../mocks/officeEquipment';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { buildOfficeEquipmentSchema } from './schema';
import {
    Box,
    Breadcrumbs,
    Chip,
    Link,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import OfficeEquipmentForm from './AssetForm';
import { getOfficeEquipmentByIDService, updateOfficeEquipmentService } from './service';
import Loading from '../../../components/loading';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateGeneralAssetInStore } from './slice';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { ROUTES } from '../../../core/routes/routes';

const PRIMARY_COLOR = '#08796C';

const UpdateGeneralAsset = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { typeId, id } = useParams<{ typeId: string; id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<any>(officeEquipmentMock[0]);
    const [params, setParams] = useState<Record<string, any>>({});
    const [assetName, setAssetName] = useState<string>('Asset');
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const assetType = assetTypes.find(t => String(t.id) === typeId);

    const findAssetByID = async () => {
        setLoading(true);
        try {
            const response = await getOfficeEquipmentByIDService(id as string) as IOfficeEquipmentAxiosResponse;
            if (response.status === 200) {
                setAssetName(response.data.assetName || assetType?.name || 'Asset');
                setParams({
                    branchName: response.data.branch?.name,
                    assignedToFirstName: response.data.assignedTo?.firstName,
                    lpoNumber: response.data.stock?.lpoNumber,
                    supplierName: response.data.supplier?.name
                });
                setDefaultAsset({
                    ...response.data,
                    supplier: response.data.supplier?.id,
                    assignedTo: response.data.assignedTo?.id,
                    branch: response.data.branch?.id,
                    assetStatus: response.data.assetStatus?.id,
                    assetType: response.data.assetType?.id,
                    category: response.data.commodity?.id,
                    engravedNumber: response.data.engravedNumber || '',
                    unitOfMeasure: response.data.unitOfMeasure || '',
                    netValueB: response.data.netValueB || '',
                    assetDepreciationRate: response.data.assetDepreciationRate || '',
                    hostname: response.data.hostname || '',
                    detailNetBookValue: response.data.detailNetBookValue || '',
                    make: response.data.make || '',
                    lpoNumber: response.data.stock?.lpoNumber
                });
            } else {
                toast.error('Failed to load asset details');
            }
        } catch (error) {
            console.error('Error fetching asset:', error);
            toast.error('Failed to load asset details');
        }
        setLoading(false);
    };

    useEffect(() => { findAssetByID(); }, [id]);

    const schema = buildOfficeEquipmentSchema(assetType?.fieldConfig);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        trigger
    } = useForm<IOfficeEquipment>({
        mode: 'onChange',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema) as any,
    });

    useEffect(() => {
        reset({ ...defaultAsset });
    }, [defaultAsset, reset]);

    const onSubmit = async (formData: IOfficeEquipment) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            assetType: typeId ? Number(typeId) : formData.assetType
        };
        try {
            const response = await updateOfficeEquipmentService(request, id as string) as IOfficeEquipmentAxiosResponse;
            if (response.status === 201) {
                toast.success('Asset updated successfully');
                dispatch(updateGeneralAssetInStore(response.data));
            } else {
                toast.error('Failed to update asset');
            }
        } catch (error) {
            console.error('Error updating asset:', error);
            toast.error('Failed to update asset. Please try again.');
        }
        setSendingRequest(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
            }}
        >
            {/* ── Page Nav Bar ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}`)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
                            color: alpha(PRIMARY_COLOR, 0.85), px: 1.5, py: 0.6, borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.22)}`, bgcolor: alpha(PRIMARY_COLOR, 0.04),
                            transition: 'all 0.18s ease',
                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.09), borderColor: alpha(PRIMARY_COLOR, 0.4), color: PRIMARY_COLOR },
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to {assetType?.name || 'Assets'}
                        </Typography>
                    </Box>
                    <Breadcrumbs separator="›" sx={{ '& .MuiBreadcrumbs-separator': { color: alpha('#000', 0.3), mx: 0.5 }, display: { xs: 'none', sm: 'flex' } }}>
                        <Link underline="hover" onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <HomeOutlinedIcon sx={{ fontSize: 14 }} />Home
                        </Link>
                        <Link underline="hover" onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}`)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <CategoryOutlinedIcon sx={{ fontSize: 14 }} />{assetType?.name || 'Assets'}
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_COLOR, fontWeight: 600 }}>Edit — {assetName}</Typography>
                    </Breadcrumbs>
                </Stack>
                <Chip
                    icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={`Editing: ${assetName}`}
                    size="small"
                    sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: alpha('#0369a1', 0.07), color: '#0369a1', border: `1px solid ${alpha('#0369a1', 0.2)}`, '& .MuiChip-icon': { color: '#0369a1' } }}
                />
            </Box>

            {/* ── Form ── */}
            {loading ? (
                <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                    <Loading items={assetType?.name || 'Asset'} />
                </Box>
            ) : (
                <form style={{ width: '100%' }} autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                    <OfficeEquipmentForm
                        buttonText="Update Asset"
                        formState={formState}
                        control={control}
                        sendingRequest={sendingRequest}
                        register={register}
                        lpoParams={{ lpoNumber: params?.lpoNumber }}
                        userParams={{ firstName: params?.assignedToFirstName }}
                        supplierParams={{ name: params?.supplierName }}
                        branchParams={{ name: params?.branchName }}
                        trigger={trigger}
                        overrideAssetTypeId={typeId ? Number(typeId) : undefined}
                    />
                </form>
            )}
        </Box>
    );
};

export default UpdateGeneralAsset;
