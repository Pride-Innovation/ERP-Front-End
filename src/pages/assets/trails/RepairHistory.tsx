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

const RepairHistory = ({ id }: { id: string | number }) => {

    const {
        endPoint,
        columnHeaders,
        header,
        modalState,
        open,
        handleClose,
        handleCreation,
        fetchResources,
        loading,
        repairsTableData,
        handleOptionClicked
    } = RepairHistoryUtills()


    useEffect(() => {
        fetchResources(id as number);
    }, []);


    return (
        <>
            {modalState === crudStates.read &&
                <ModalComponent title='View Repair History' open={open} handleClose={handleClose} width="60%">
                    {/* <CreateRepairHistory handleClose={handleClose} /> */}
                    <p>Modal Information!!</p>
                </ModalComponent>
            }
            {modalState === crudStates.update &&
                <ModalComponent title='Complete Repair' open={open} handleClose={handleClose} width="60%">
                    {/* <UpdateRepairHistory repairDetails={repairDetails} handleClose={handleClose} /> */}
                    <p>Modal Information!!</p>
                </ModalComponent>
            }
            {modalState === crudStates.upload &&
                <ModalComponent title='Uploaded Repair Documents' open={open} handleClose={handleClose} width="40%">
                    {/* <DisableUser setSendingRequest={setSendingRequest} user={user} handleClose={handleClose} buttonText='Disable' sendingRequest={false} /> */}
                    <p>Modal Information!!</p>
                </ModalComponent>
            }

            <Grid xs={12} container>
                {modalState === crudStates.create &&
                    <ModalComponent
                        title='Create Repair History'
                        open={open}
                        handleClose={handleClose}
                        width="60%"
                    >
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
                        rows={repairsTableData}
                        columnHeaders={columnHeaders}
                        paginationMode='client'
                        onCreationHandler={handleCreation}
                        handleOptionClicked={handleOptionClicked}
                    />
                }
            </Grid>
        </>
    )
}

export default RepairHistory