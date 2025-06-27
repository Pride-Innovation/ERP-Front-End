/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react"
import { Grid } from "@mui/material"
import TableComponent from "../../../components/tables/TableComponent"
import AssignmentHistoryUtills from "./AssignmentHistoryUtills"
import { crudStates } from "../../../utils/constants"
import ModalComponent from "../../../components/modal"

const AssignmentHistory = ({ id }: { id: string | number }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const {
        endPoint,
        columnHeaders,
        header,
        modalState,
        open,
        handleClose,
        handleCreation
    } = AssignmentHistoryUtills()

    const fetchResources = async () => {
        setLoading(true)
        try {

        } catch (error) {

        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources();
    }, [id]);

    return (
        <>
            <Grid xs={12} container>
                {modalState === crudStates.create &&
                    <ModalComponent title='Create User' open={open} handleClose={handleClose} width="60%">
                        <p>Modal Information!!</p>
                    </ModalComponent>
                }
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        createAction
                        header={header}
                        module=""
                        rows={[]}
                        columnHeaders={columnHeaders}
                        paginationMode='client'
                        onCreationHandler={handleCreation}
                    />
                }
            </Grid>
        </>
    )
}

export default AssignmentHistory