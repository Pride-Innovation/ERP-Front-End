import { useContext, useEffect, useState } from "react";
import { PERMISSIONS } from '../../../core/permissions/constants';
import { IGRNReport } from "../interface";
import GrnReportUtills from "./grnReportUtills";
import {
    Box,
    Typography,
    alpha,
    Card,
    Alert,
    Chip,
    Stack,
} from "@mui/material";
import TableComponent from "../../../components/tables/TableComponent";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import UploadGRN from "../UploadGRN";
import { fetchGrnDocumentService } from "../service";
import ButtonComponent from "../../../components/forms/Button";
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import moment from "moment";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import ArrowCircleDownOutlinedIcon from '@mui/icons-material/ArrowCircleDownOutlined';
import { InventoryContext } from "../../../context/inventory";
import { brand, neutral, status as statusTokens } from "../../../utils/tokens";

const GOLD = '#BC892C';

const InventoryGRN = ({ grnList, onUploaded }: { grnList: IGRNReport[]; onUploaded?: () => void }) => {
    const [fileURL, setFileURL] = useState<string>("");
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
        handleInventoryTableData(grnList as Array<IGRNReport>);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grnList]);

    useEffect(() => {
        let objectUrl: string | null = null;

        if (currentGRN?.id && (currentGRN?.documentPath as string)?.length > 0) {
            // Fetch the signed document through the authenticated API (not a public /statics URL)
            // and render it from an in-memory object URL.
            fetchGrnDocumentService(currentGRN.id)
                .then((res) => {
                    objectUrl = URL.createObjectURL(res.data as Blob);
                    setFileURL(objectUrl);
                })
                .catch(() => setFileURL(""));
        } else {
            setFileURL("");
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [currentGRN]);

    useEffect(() => {
        setOptions([
            { value: crudStates.read, label: "View GRN", icon: <VisibilityOutlinedIcon fontSize='small' color='primary' /> },
            { value: crudStates.download, label: "Generate GRN", icon: <ArrowCircleDownOutlinedIcon fontSize='small' color='inherit' /> },
            // Writing a signed GRN back against a stock receipt is a change to the receipt.
            { value: crudStates.upload, label: "Upload Signed GRN", icon: <EditCalendarOutlinedIcon fontSize='small' color='secondary' />, permission: PERMISSIONS.UPDATE_INVENTORY },
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGRN]);

    return (
        <Box>
            {/* Upload GRN Modal */}
            {modalState === crudStates.upload && (
                <ModalComponent title='Upload Signed GRN' open={open} handleClose={handleClose} width="40%">
                    <UploadGRN
                        id={currentGRN?.id}
                        grnNumber={currentGRN?.name}
                        handleClose={handleClose}
                        onUploaded={() => { handleClose(); onUploaded?.(); }}
                    />
                </ModalComponent>
            )}

            {/* View GRN Modal */}
            {modalState === crudStates.read && (
                <ModalComponent title='View Goods Received Note' open={open} handleClose={handleClose} width="50%">
                    {fileURL ? (
                        <>
                            <Card
                                elevation={0}
                                sx={{ mb: 2, p: 2, bgcolor: alpha(brand[500], 0.04), borderRadius: 2, border: `1px solid ${alpha(brand[500], 0.12)}` }}
                            >
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <AssignmentOutlinedIcon sx={{ color: brand[600], fontSize: '1.1rem' }} />
                                        <Typography variant="subtitle2" sx={{ color: neutral[500] }}>GRN Number</Typography>
                                        <Chip
                                            label={currentGRN?.name || 'N/A'}
                                            size="small"
                                            sx={{ fontWeight: 700, bgcolor: alpha(brand[500], 0.1), color: brand[700] }}
                                        />
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CalendarTodayOutlinedIcon sx={{ color: GOLD, fontSize: '1rem' }} />
                                        <Typography variant="body2" sx={{ color: neutral[600] }}>
                                            {currentGRN?.createDate ? moment(currentGRN.createDate).format('DD MMM YYYY') : 'N/A'}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Card>

                            <Card elevation={0} sx={{ border: `1px solid ${alpha('#000', 0.1)}`, borderRadius: 2, overflow: 'hidden' }}>
                                <iframe
                                    src={`${fileURL}#toolbar=0&navpanes=0&scrollbar=0`}
                                    title="PDF Preview"
                                    width="100%"
                                    style={{ border: 'none', height: '350px', overflow: 'hidden' }}
                                />
                            </Card>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Box sx={{ width: '100px' }}>
                                    <ButtonComponent sendingRequest={false} buttonText="Close" variant="contained" buttonColor="secondary" handleClick={handleClose} />
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Alert severity="warning" sx={{ borderRadius: 2, bgcolor: statusTokens.warning.soft, border: `1px solid ${alpha(statusTokens.warning.main, 0.25)}` }}>
                            Document not available for preview.
                        </Alert>
                    )}
                </ModalComponent>
            )}

            {/* Section header */}
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 }, pb: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(GOLD, 0.1), color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }}>
                        Goods Received Notes
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                        Generate, view and upload signed GRN documents
                    </Typography>
                </Box>
            </Stack>

            {grnList?.length > 0 ? (
                <TableComponent
                tableKey="grnDocuments"
                    endPoint={endPoint}
                    loading={false}
                    exportData
                    flat
                    header={header}
                    module="GRN documents"
                    rows={stocksTableData || []}
                    columnHeaders={columnHeaders}
                    paginationMode='client'
                    handleOptionClicked={handleOptionClicked}
                    filterOptions
                />
            ) : (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <ReceiptLongOutlinedIcon sx={{ fontSize: 40, color: neutral[300], mb: 1 }} />
                    <Typography variant="body2" sx={{ color: neutral[500] }}>
                        No GRN documents available for this inventory.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default InventoryGRN;
