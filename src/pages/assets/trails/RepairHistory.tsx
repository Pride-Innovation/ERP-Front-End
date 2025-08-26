/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from "react";
import { crudStates } from "../../../utils/constants";
import { Grid } from "@mui/material";
import ModalComponent from "../../../components/modal";
import TableComponent from "../../../components/tables/TableComponent";
import RepairHistoryUtills from "./RepairHistoryUtills";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

const RepairHistory = ({ id }: { id: string | number }) => {

    const { assetRepairHistory } = useSelector((state: RootState) => state.AssetAssignmentHistoryStore);

    const {
        endPoint,
        columnHeaders,
        header,
        modalState,
        open,
        handleClose,
        handleCreation,
        fetchResources,
        loading
    } = RepairHistoryUtills()


    useEffect(() => {
        fetchResources(id as number);
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