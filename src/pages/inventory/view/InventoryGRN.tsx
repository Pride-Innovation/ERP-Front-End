import { useContext, useEffect, useState } from "react";
import { IGRNReport } from "../interface";
import GrnReportUtills from "./grnReportUtills";
import {
    Box,
    Grid,
    Typography,
    alpha,
    Divider,
    useTheme,
    Card,
    Alert,
    Fade,
    CircularProgress,
    Chip,
    Stack
} from "@mui/material";
import TableComponent from "../../../components/tables/TableComponent";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import UploadGRN from "../UploadGRN";
import ButtonComponent from "../../../components/forms/Button";
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import moment from "moment";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import ArrowCircleDownOutlinedIcon from '@mui/icons-material/ArrowCircleDownOutlined';
import { InventoryContext } from "../../../context/inventory";

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const InventoryGRN = ({ grnList }: { grnList: IGRNReport[] }) => {
    const [fileURL, setFileURL] = useState<string>("");
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const { setOptions } = useContext(InventoryContext);

    const {
        columnHeaders,
        endPoint,
        header,
        stocksTableData,
        handleInventoryTableData,
        handleOptionClicked,
        modalState,
        open,
        currentGRN,
        handleClose
    } = GrnReportUtills();

    useEffect(() => {
        setLoading(true);
        handleInventoryTableData(grnList as Array<IGRNReport>);
        setTimeout(() => setLoading(false), 500);
    }, [grnList]);

    useEffect(() => {
        if ((currentGRN?.documentPath as string)?.length > 0) {
            const filename = currentGRN?.documentPath.split('/').pop();
            const publicPath = `/statics/${filename}`;
            setFileURL(publicPath);
        } else {
            setFileURL("");
        }
    }, [currentGRN]);

    useEffect(() => {
        const newOptions = grnList.map(grn => {
            return grn?.documentPath?.length > 0 ? [
                {
                    value: crudStates.read,
                    label: "View GRN",
                    icon: <VisibilityOutlinedIcon fontSize='small' color='primary' />
                }
            ] : grn?.grnDownloaded === true ? [
                {
                    value: crudStates.download,
                    label: "Generate GRN",
                    icon: <ArrowCircleDownOutlinedIcon fontSize='small' color='inherit' />
                },
                {
                    value: crudStates.upload,
                    label: "Upload Signed GRN",
                    icon: <EditCalendarOutlinedIcon fontSize='small' color='secondary' />
                },
            ] : [{
                value: crudStates.download,
                label: "Generate GRN",
                icon: <ArrowCircleDownOutlinedIcon fontSize='small' color='inherit' />
            }]
        });

        setOptions(newOptions.flat());
    }, [currentGRN]);

    return (
        <Fade in={!loading}>
            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                {/* Upload GRN Modal */}
                {modalState === crudStates.upload && (
                    <ModalComponent
                        title='Upload Signed GRN'
                        open={open}
                        handleClose={handleClose}
                        width="40%"
                    >
                        <UploadGRN id={currentGRN?.id} />
                    </ModalComponent>
                )}

                {/* View GRN Modal */}
                {modalState === crudStates.read && (
                    <ModalComponent
                        title='View Goods Received Note'
                        open={open}
                        handleClose={handleClose}
                        width="80%"
                    >
                        {fileURL ? (
                            <>
                                <Card
                                    elevation={0}
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        bgcolor: alpha(PRIMARY_COLOR, 0.04),
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <AssignmentOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: '1.1rem' }} />
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    GRN Number
                                                </Typography>
                                                <Chip
                                                    label={currentGRN?.name || 'N/A'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                                        color: PRIMARY_COLOR
                                                    }}
                                                />
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                                                <CalendarTodayOutlinedIcon sx={{ color: SECONDARY_COLOR, fontSize: '1rem' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Created: {currentGRN?.createDate ? moment(currentGRN.createDate).format('DD MMM YYYY') : 'N/A'}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Card>

                                <Card
                                    elevation={0}
                                    sx={{
                                        border: `1px solid ${alpha('#000', 0.1)}`,
                                        borderRadius: 2,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <iframe
                                        src={fileURL}
                                        title="PDF Preview"
                                        width="100%"
                                        style={{
                                            border: 'none',
                                            height: '600px',
                                            overflow: 'hidden'
                                        }}
                                    />
                                </Card>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <ButtonComponent
                                        sendingRequest={false}
                                        buttonText="Close"
                                        variant="contained"
                                        buttonColor="secondary"
                                        handleClick={handleClose}
                                    />
                                </Box>
                            </>
                        ) : (
                            <Alert
                                severity="warning"
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                                }}
                            >
                                Document not available for preview.
                            </Alert>
                        )}
                    </ModalComponent>
                )}

                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                                bgcolor: alpha(SECONDARY_COLOR, 0.08),
                                color: SECONDARY_COLOR,
                                width: 32,
                                height: 32
                            }}
                        >
                            <ReceiptOutlinedIcon />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                color: theme.palette.text.primary,
                                fontWeight: 600
                            }}
                        >
                            Goods Received Notes
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                        View and manage all GRN documents related to this inventory
                    </Typography>
                    <Divider sx={{ mt: 1.5 }} />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} sx={{ color: SECONDARY_COLOR }} />
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {grnList?.length > 0 ? (
                                <TableComponent
                                    endPoint={endPoint}
                                    loading={false}
                                    count={stocksTableData.length}
                                    exportData
                                    header={header}
                                    module="GRN documents"
                                    rows={stocksTableData || []}
                                    columnHeaders={columnHeaders}
                                    paginationMode='server'
                                    handleOptionClicked={handleOptionClicked}
                                />
                            ) : (
                                <Alert
                                    severity="info"
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.info.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                                    }}
                                >
                                    No GRN documents available for this inventory.
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Fade>
    );
};

export default InventoryGRN;