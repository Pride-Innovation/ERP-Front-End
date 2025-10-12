/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import RequestForm from './RequestForm';
import { requestMock } from '../../../mocks/request';
import { IRequest, IRequestAxiosResponse } from '../interface';
import { requestSchema } from './schema';
import { findAssetRequestByIDService, updateAssetRequestService } from './service';
import { RequestContext } from '../../../context/request/RequestContext';
import { ICommodity } from '../../settings/commodity/interface';
import { RowData } from '../../../components/forms/interface';
import { validateInventoryItems } from '../../../utils/helpers';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import CommodityUtills from '../../settings/commodity/utills';
import { ROUTES } from '../../../core/routes/routes';

const UpdateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>("");
    const { id } = useParams<{ id: string }>();
    const [defaultRequest, setDefaultRequest] = useState<any>(requestMock[0]);
    const { setRows, rows } = useContext(RequestContext);
    const [file, setFile] = useState<File | null>(null);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const { fetchAllCommodities } = CommodityUtills();
    const navigate = useNavigate();

    // New state to track if file was initially present and file type
    const [initialFile, setInitialFile] = useState<{
        fileName: string | null;
        fileType: 'pdf' | 'word' | 'excel' | 'image' | 'other';
        filePath: string | null;
    }>({
        fileName: null,
        fileType: 'other',
        filePath: null
    });

    useEffect(() => { fetchAllCommodities() }, []);

    // Helper function to determine file type from extension
    const getFileType = (fileName: string): 'pdf' | 'word' | 'excel' | 'image' | 'other' => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (!extension) return 'other';

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
            return 'image';
        } else if (extension === 'pdf') {
            return 'pdf';
        } else if (['doc', 'docx'].includes(extension)) {
            return 'word';
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return 'excel';
        }

        return 'other';
    };

    const findAssetRequestById = async () => {
        try {
            const response = await findAssetRequestByIDService(id as string) as IRequestAxiosResponse;
            if (response.status === 200) {
                const { data } = response;
                setDefaultRequest({ ...data, status: data.status?.id });

                // Process file information from signaturePath
                if (data.signaturePath) {
                    const filePath = data.signaturePath;
                    const fileName = filePath.split(/[\/\\]/).pop() || '';

                    // Set signature preview path for UI display
                    // Extract the file name and create a path relative to public folder
                    const filePathForPreview = `/statics/${fileName}`;
                    setSignature(filePathForPreview);

                    // Store file information for display
                    setInitialFile({
                        fileName,
                        fileType: getFileType(fileName),
                        filePath: filePath
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => { findAssetRequestById() }, [id]);

    const handleRows = () => {
        if (defaultRequest?.commodities
            && commodities?.length > 0) {
            const rowData = (defaultRequest.commodities as Array<{
                commodity: ICommodity,
                quantity: number
            }>
            ).map((commodity, index) => ({
                id: Date.now() + index,
                name: commodity.commodity.name,
                groupName: commodity.commodity.groupName,
                quantity: commodity.quantity,
                commodityId: commodity.commodity.id,
                assetTypeId: commodity.commodity.assetType?.id,
            })) as Array<RowData>;

            setRows(rowData);
        }
    }

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IRequest>({
        mode: 'onChange',
        resolver: yupResolver(requestSchema),
    });

    useEffect(() => {
        handleRows()
        reset({ ...defaultRequest });
    }, [defaultRequest]);

    const onSubmit = async (formData: IRequest) => {
        setSendingRequest(true);
        const result = validateInventoryItems(rows);

        if (result.isValid && result.validData) {

            const payload = new FormData();
            payload.append("priority", formData.priority);
            payload.append("name", formData.name);
            payload.append("description", formData.description as string);

            // Only attach file if a new file was selected
            if (file) payload.append("file", file);

            // Send a flag to indicate if we're keeping or removing the file
            // If no file is selected and there was no initial file or the initial file was cleared,
            // then we're removing the file
            const shouldRemoveFile = !file && (initialFile.fileName === null || signature === '');
            payload.append("removeFile", shouldRemoveFile.toString());

            const formattedCommodities = result.validData.map(item => ({
                commodityId: item.id,
                quantity: item.quantity
            }));

            payload.append("requestCommodities", JSON.stringify(formattedCommodities));

            try {
                const response = await updateAssetRequestService(payload, id as string) as IRequestAxiosResponse;
                if (response.status === 200) {
                    // Update the file information if the request was successful and a new file was uploaded
                    if (file) {
                        setInitialFile({
                            fileName: file.name,
                            fileType: getFileType(file.name),
                            filePath: null // We don't know the server path yet
                        });
                    }
                    toast.success("Request updated successfully");
                    navigate(ROUTES.REQUEST);
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to update request");
            }

        } else {
            toast.error(`Requests validation errors: ${result.errors}`);
        }

        setSendingRequest(false);
    };

    // Function to handle file removal
    const handleRemoveFile = () => {
        setFile(null);
        setSignature('');
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
            <Typography
                sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#BC892C",
                    mb: 3
                }}
            >
                Update Request
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Box component="form" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <RequestForm
                            setImage={setSignature}
                            setFile={setFile}
                            image={signature}
                            file={file}
                            initialFile={initialFile}
                            onRemoveFile={handleRemoveFile}
                            formState={formState}
                            control={control}
                            register={register}
                            sendingRequest={sendingRequest}
                            buttonText="Update"
                        />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    )
}

export default UpdateRequest