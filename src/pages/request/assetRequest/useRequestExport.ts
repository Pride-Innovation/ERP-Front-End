/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import TableUtills from '../../../components/tables/utills';
import { fetchRowsService } from '../../../core/apis/globalService';
import { IRequest } from '../interface';
import RequestUtills from './utills';
import {
    REQUEST_EXPORT_MAX_ROWS,
    buildRequestFilterSummary,
} from './requestTableConfig';

/**
 * Filter-aware export for every request tab.
 *
 * <p>Without an `onExport`, the toolbar falls through to the shared default, which calls
 * `/export/request` — an endpoint that takes only status ids and a date range. Everything the user
 * had actually filtered by was therefore discarded: exporting the Pending tab narrowed to one
 * requester produced a file of every pending request in the bank.
 *
 * <p>This refetches through the same endpoint the table reads, with the same parameters, so the file
 * always matches what is on screen. Rows come from `/requests` rather than the table's own array
 * because the table holds one page — exporting that would turn a filter matching four hundred
 * requests into a file of ten.
 *
 * @param tabLabel names the view on the PDF strip and the Excel cover ("Pending", "Rejected", …)
 */
const useRequestExport = (tabLabel: string) => {
    const { endPoint, buildRequestExportRows } = RequestUtills();
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    // The branded Cover + Data workbook, and the reports-style PDF.
    const { generateExcelFromRows, generatePDFFromRows } = TableUtills({ moduleName: 'request', tableKey: 'assetRequests' });

    /**
     * @param format  which file to produce
     * @param params  the parameters currently in force for this tab — its base merged with whatever
     *                the user has filtered by
     */
    const exportRequests = async (
        format: 'pdf' | 'excel',
        params: Record<string, any>,
    ): Promise<void> => {
        const meta = {
            filters: buildRequestFilterSummary(params, statuses, tabLabel),
            title: `${tabLabel} Requests`,
        };

        try {
            const response: any = await fetchRowsService({
                pageNumber: 0,
                pageSize: REQUEST_EXPORT_MAX_ROWS,
                endPoint,
                params,
            });

            const content: IRequest[] = response?.data?.content ?? [];
            if (content.length === 0) {
                toast.info('No requests match the current filters.');
                return;
            }
            if (content.length >= REQUEST_EXPORT_MAX_ROWS) {
                toast.warning(
                    `Export capped at ${REQUEST_EXPORT_MAX_ROWS.toLocaleString()} rows — `
                    + 'narrow the filters for the full set.'
                );
            }

            // The table's own mapper, so the export carries resolved requester and approver names
            // and a formatted date rather than nested entity graphs.
            const rows = buildRequestExportRows(content);
            if (format === 'excel') await generateExcelFromRows(rows, meta);
            else await generatePDFFromRows(rows, meta);
        } catch (error) {
            console.error('Request export failed', error);
            toast.error('Could not build the export. Please try again.');
        }
    };

    return { exportRequests };
};

export default useRequestExport;
