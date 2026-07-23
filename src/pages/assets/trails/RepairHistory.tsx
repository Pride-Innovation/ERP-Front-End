/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect } from "react";
import { crudStates } from "../../../utils/constants";
import { Box } from "@mui/material";
import ModalComponent from "../../../components/modal";
import TableComponent from "../../../components/tables/TableComponent";
import RepairHistoryUtills from "./RepairHistoryUtills";
import Description from "./repairs/Description";
import Attachment from "./repairs/Attachment";
import CompleteRepair from "./repairs/CompleteRepair";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';
import { AssetContext } from "../../../context/asset";

const RepairHistory = ({ id }: { id: string | number }) => {
    const { setOptions } = useContext(AssetContext);


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
        handleOptionClicked,
        repairDetails
    } = RepairHistoryUtills()


    useEffect(() => {
        fetchResources(id as number);
    }, []);


    useEffect(() => {
        if (repairsTableData.length > 0) {
            const newOptions = [
                { value: crudStates.read, label: "Description", icon: <DescriptionOutlinedIcon fontSize='small' color='secondary' /> },
                { value: crudStates.update, label: "Complete Repair", icon: <HandymanOutlinedIcon fontSize='small' color='info' /> },
                { value: crudStates.upload, label: "Attachments", icon: <AttachmentOutlinedIcon fontSize='small' color='inherit' /> },
            ]

            setOptions(newOptions.flat());
        }

    }, [repairsTableData]);

    return (
        <>
            {modalState === crudStates.read &&
                <ModalComponent title='View Repair History' open={open} handleClose={handleClose} width="60%">
                    <Description repair={repairDetails as any} handleClose={handleClose} />
                </ModalComponent>
            }
            {modalState === crudStates.update &&
                <ModalComponent title='Complete Repair' open={open} handleClose={handleClose} width="60%">
                    <CompleteRepair repair={repairDetails as any} handleClose={handleClose} />
                </ModalComponent>
            }
            {modalState === crudStates.upload &&
                <ModalComponent title='Uploaded Repair Documents' open={open} handleClose={handleClose} width="75%">
                    <Attachment repair={repairDetails as any} handleClose={handleClose} />
                </ModalComponent>
            }

            <Box sx={{ width: '100%' }}>
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
                        exportData
                        // createAction
                        header={header}
                        rows={repairsTableData}
                        module="Repairs & Maintenance"
                        columnHeaders={columnHeaders}
                        paginationMode='client'
                        onCreationHandler={handleCreation}
                        handleOptionClicked={handleOptionClicked}
                        filterOptions
                    />
                }
            </Box>
        </>
    )
}

export default RepairHistory