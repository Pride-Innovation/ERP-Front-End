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
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                border: `1px solid ${alpha('#000', 0.08)}`,
            }}
        >
            <Grid container spacing={4}>
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

                    <PageSection
                        title="Request Items"
                        subtitle="Add items you want to request"
                        helpText="Specify the assets you're requesting with accurate quantities"
                        icon={<DescriptionIcon />}
                    >
                        <Box sx={{ width: '100%' }}>
                            <InventoryTable title="Request Items" />
                        </Box>
                    </PageSection>
                </Grid>

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
            </Grid>

            <Box
                sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${alpha('#000', 0.08)}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={() => navigate(ROUTES.REQUEST)}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            minWidth: { xs: '100%', sm: 110 },
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: alpha('#000', 0.3),
                                bgcolor: alpha('#000', 0.05),
                            },
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
                            bgcolor: PRIMARY_COLOR,
                            boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.3)}`,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#065f54',
                                transform: 'translateY(-1px)',
                                boxShadow: `0 6px 16px ${alpha(PRIMARY_COLOR, 0.4)}`,
                            },
                            transition: 'all 0.2s ease',
                            '&.Mui-disabled': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.5),
                                color: '#fff',
                            },
                        }}
                    >
                        {sendingRequest ? 'Submitting...' : buttonText}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default RequestForm;
