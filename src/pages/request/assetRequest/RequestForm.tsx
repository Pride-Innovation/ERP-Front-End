/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Grid, Paper, Stack, alpha } from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import { IRequestForm } from '../interface';
import { ROUTES } from '../../../core/routes/routes';
import RequestUtills from './utills';
import InventoryTable from '../../../components/forms/InventoryTable';
import { brand } from '../../../utils/tokens';
import { PageSection } from '../../../components/layout';
import BasicInformationPanel from './panels/BasicInformationPanel';
import CategoryAttributesPanel from './panels/CategoryAttributesPanel';
import FileUploadPanel from './panels/FileUploadPanel';
import WorkflowPreviewPanel from './panels/WorkflowPreviewPanel';

const PRIMARY_COLOR = brand[500];

const RequestForm = ({
    register,
    control,
    formState,
    setValue,
    sendingRequest,
    buttonText,
    setImage,
    setFile,
    image,
    file,
    hideFileUpload = false,
    initialFile,
    onRemoveFile,
}: IRequestForm & { hideFileUpload?: boolean }) => {
    const { formFields } = RequestUtills();
    const navigate = useNavigate();

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: '12px',
                bgcolor: '#fff',
                border: '1px solid #E8EDF3',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
        >
            <Grid container spacing={4}>
                {/* Left column — core request details */}
                <Grid item xs={12} md={hideFileUpload ? 12 : 8}>
                    <PageSection
                        title="Basic Information"
                        subtitle="Enter the core details of your request"
                        helpText="Provide essential information to identify and prioritize your request"
                        icon={<ArticleIcon />}
                    >
                        <BasicInformationPanel
                            register={register}
                            control={control}
                            formState={formState}
                            formFields={formFields}
                        />
                    </PageSection>

                    <CategoryAttributesPanel control={control} setValue={setValue} />

                    <WorkflowPreviewPanel control={control} />
                </Grid>

                {/* Right column — supporting docs */}
                {!hideFileUpload && (
                    <Grid item xs={12} md={4}>
                        <PageSection
                            title="Supporting Documentation"
                            subtitle="Attach any relevant files to support your request"
                            helpText="Add documents like approvals, specifications, or justifications"
                        >
                            <FileUploadPanel
                                image={image}
                                setImage={setImage}
                                file={file}
                                setFile={setFile}
                                initialFile={initialFile}
                                onRemoveFile={onRemoveFile}
                            />
                        </PageSection>
                    </Grid>
                )}

                {/* Full-width row — request items table */}
                <Grid item xs={12}>
                    <PageSection
                        title="Request Items"
                        subtitle="Add the assets you want to request with accurate quantities"
                        helpText="Specify each item — select the asset type first, then the item name"
                        icon={<DescriptionIcon />}
                        mb={0}
                    >
                        <InventoryTable title="Request Items" />
                    </PageSection>
                </Grid>
            </Grid>

            <Box
                sx={{
                    mt: 4,
                    pt: 2.5,
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={() => navigate(ROUTES.REQUEST)}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            minWidth: { xs: '100%', sm: 110 },
                            height: 38,
                            borderRadius: '8px',
                            borderColor: '#E2E8F0',
                            color: '#64748B',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.85rem',
                            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={sendingRequest}
                        startIcon={<SendIcon />}
                        sx={{
                            minWidth: { xs: '100%', sm: 160 },
                            height: 38,
                            borderRadius: '8px',
                            bgcolor: PRIMARY_COLOR,
                            boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.25)}`,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            '&:hover': {
                                bgcolor: '#065f54',
                                boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.35)}`,
                            },
                            '&.Mui-disabled': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.45),
                                color: '#fff',
                            },
                        }}
                    >
                        {sendingRequest ? 'Submitting…' : buttonText}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default RequestForm;
