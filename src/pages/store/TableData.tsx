/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import TableComponent from '../../components/tables/TableComponent';
import { ITableHeader } from '../../components/tables/interface';
import { StoreMocks } from '../../mocks/store';
import { crudStates } from '../../utils/constants';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { IStore, IStoreReportTableData } from './interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';
import DisplaySettingsOutlinedIcon from '@mui/icons-material/DisplaySettingsOutlined';
import ModalComponent from '../../components/modal';
import StoreDetails from './StoreDetails';
import { Box } from '@mui/material';


/**
 * The stock level of one balance line, by its own reorder threshold.
 *
 * <p>Mirrors the backend rule exactly — `minLevel > 0 && quantity <= minLevel` — which is what
 * `/inventory/low-stock`, the branch overview and the "Reorder at" column on the Balances panel all
 * use. This column previously invented its own bands in the browser (under 5 low, 5-10 warning, over
 * 10 in stock) and ignored `minLevel` entirely, so a commodity with a threshold of 50 and 30 on hand
 * read "in stock" here while the low-stock monitor correctly flagged it. Two screens, two answers,
 * same commodity.
 *
 * <p>"Not monitored" is a real answer rather than a blank: a line with no threshold set is never
 * flagged however little of it is on hand, and saying so is what prompts somebody to set one.
 */
const stockLevelOf = (quantity: number, minLevel?: number | null): string => {
    if (!minLevel || minLevel <= 0) return 'not monitored';
    if (quantity <= minLevel / 2) return 'low';
    if (quantity <= minLevel) return 'warning';
    return 'in stock';
};

const TableData = () => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { stores } = useSelector((state: RootState) => state.StoreStore);
    const {
        count, setStoreReportTableData, storeReportTableData,
        branchId, currentAssetType, storeType,
    } = useContext(StoreContext);

    const {
        sendingRequest,
        handleOptionClicked,
        open,
        handleClose,
        currentState
    } = StoreUtills();

    const {
        commodity,
        branch,
        id,
        ...data
    } = StoreMocks[0];

    const rowData = {
        name: StoreMocks[0].commodity.name,
        unitOfMeasure: StoreMocks[0].commodity.groupName,
        ...data,
        quantity: StoreMocks[0].quantity,
        branch: StoreMocks[0].branch.name,
        status: stockLevelOf(StoreMocks[0].quantity, StoreMocks[0].minLevel),
        action: {
            label: "Options",
            options: [
                { value: crudStates.read, label: "View Details", icon: <DisplaySettingsOutlinedIcon fontSize="small" color="primary" /> },
            ]
        },
    };

    const handleReportsTableData = (storeReports: Array<IStore>) => {
        const data: Array<IStoreReportTableData> = storeReports.map((str, index) => {
            const { commodity, branch, id, ...fielsdata } = storeReports[index];
            return ({
                ...fielsdata,
                id: str.id as number,
                name: str.commodity.name,
                unitOfMeasure: str.commodity.groupName,
                quantity: str.quantity,
                branch: str.branch.name,
                status: stockLevelOf(str.quantity, str.minLevel),
            });
        });
        setStoreReportTableData(data);
    };

    useEffect(() => { handleReportsTableData(stores); }, [stores]);
    useEffect(() => { setColumnHeaders(getTableHeaders(rowData)); }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Details modal */}
            {crudStates.read === currentState && (
                <ModalComponent width="60%" title="Stock Item Details" open={open} handleClose={handleClose}>
                    {/* The modal's open state lives in StoreContext now, so every caller of
                        StoreUtills() sees the same dialog. The handler is still passed down rather
                        than re-derived: the component that owns a dialog should be the one that
                        closes it. */}
                    <StoreDetails handleClose={handleClose} />
                </ModalComponent>
            )}

            {/* Data table */}
            <TableComponent
                endPoint="store"
                // Server pagination must carry the same scope as the initial fetch —
                // branch, asset category, and the page's store container.
                params={{
                    branchId,
                    assetTypeId: currentAssetType.id,
                    ...(storeType ? { storeType: storeType.toUpperCase() } : {}),
                }}
                loading={sendingRequest}
                count={count}
                exportData
                header={{ plural: 'Store Reports', singular: 'Store' }}
                module="stores"
                rows={storeReportTableData || []}
                createAction={false}
                columnHeaders={columnHeaders}
                handleOptionClicked={handleOptionClicked}
                searchAction={false}
                paginationMode="server"
                /*
                 * No status bar here, deliberately.
                 *
                 * It rendered four chips — Office Equipment, IT Equipment, Fleet, Stationery — that
                 * were a **second category selector** sitting inside a table whose tabs already
                 * select the category. Worse, it was wrong: each chip wrote a code into
                 * `StoreContext.selectedStatus`, which `TabComponent` turned into a tab *index*
                 * through a map of four positions. The catalogue has twelve categories ordered by
                 * name, so clicking "Stationery" opened **Computers** and "Fleet" opened
                 * **Equipment**. Its default, `officeEquipment`, is why every visit landed on index
                 * 0 — *Building & Construction* — whatever you had been looking at.
                 *
                 * Two controls for one choice, one of them stale by construction. The tabs are the
                 * category selector; this was removed rather than repaired.
                 */
                /*
                 * Only filters GET /store actually declares.
                 *
                 * Spring drops a parameter no endpoint names without complaining, so a filter the
                 * page sends to a signature that does not list it looks like it worked and quietly
                 * returns the unfiltered list. All three boxes here were in that state:
                 *
                 *  - Stock Name  — now real; the endpoint declares `stockName` and matches on the
                 *                  commodity's name, partial and case-insensitive.
                 *  - Status      — removed. It offered Active / Disabled / Locked, which are
                 *                  user-account states, while the column beside it shows a stock
                 *                  level (low / warning / in stock) derived here from quantity. Two
                 *                  unrelated vocabularies, and neither reached the server.
                 *  - Stock Date  — removed. `createdAt` was never a parameter of this endpoint.
                 *
                 * A stock-level filter would need the thresholds moved to the server rather than
                 * being computed in this file; worth doing, but not by guessing what they should be.
                 */
                columnFilters={[
                    { key: 'stockName', label: 'Stock Name', type: 'text' },
                    {
                        key: 'stockLevel', label: 'Stock Level', type: 'select', options: [
                            { value: 'low', label: 'At or below reorder level' },
                            { value: 'adequate', label: 'Above reorder level' },
                            { value: 'unmonitored', label: 'No reorder level set' },
                        ]
                    },
                ]}
                // onApplyFilters={(filters) => fetchAllRequests(filters)}
            />
        </Box>
    );
};

export default TableData;
