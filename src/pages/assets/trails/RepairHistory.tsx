/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { crudStates } from "../../../utils/constants";
import { Grid } from "@mui/material";
import ModalComponent from "../../../components/modal";
import TableComponent from "../../../components/tables/TableComponent";
import RepairHistoryUtills from "./RepairHistoryUtills";

const RepairHistory = ({ id }: { id: string | number }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const {
        endPoint,
        columnHeaders,
        header,
        modalState,
        open,
        handleClose,
        handleCreation
    } = RepairHistoryUtills()

    const fetchResources = async () => {
        setLoading(true)
        try {

        } catch (error) {

        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources();
    }, []);

    return (
        <>
            <Grid xs={12} container>
                {modalState === crudStates.create &&
                    <ModalComponent title='Create Repair History' open={open} handleClose={handleClose} width="60%">
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

export default RepairHistory