/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from "react"
import { Box } from "@mui/material"
import TableComponent from "../../../components/tables/TableComponent"
import AssignmentHistoryUtills from "./AssignmentHistoryUtills"
import { crudStates } from "../../../utils/constants"
import ModalComponent from "../../../components/modal"

const AssignmentHistory = ({ id }: { id: string | number }) => {
    const {
        endPoint,
        columnHeaders,
        header,
        modalState,
        open,
        handleClose,
        handleCreation,
        fetchAssignmentHistory,
        loading,
        assetAssignmentHistoryTableData
    } = AssignmentHistoryUtills()

    useEffect(() => {
        if (id) {
            const params = { assetId: id }
            fetchAssignmentHistory(params);
        }
    }, [id]);

    return (
        <Box sx={{ width: '100%' }}>
            {modalState === crudStates.create &&
                <ModalComponent title='Create User' open={open} handleClose={handleClose} width="60%">
                    <p>Modal Information!!</p>
                </ModalComponent>
            }
            {columnHeaders.length > 0 &&
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    exportData
                    flat
                    // createAction
                    header={header}
                    module="assignment history"
                    rows={assetAssignmentHistoryTableData || []}
                    columnHeaders={columnHeaders}
                    paginationMode='client'
                    onCreationHandler={handleCreation}
                />
            }
        </Box>
    )
}

export default AssignmentHistory