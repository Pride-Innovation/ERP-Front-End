/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ITimeLineDot } from './interface'
import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RecommendOutlinedIcon from '@mui/icons-material/RecommendOutlined';
import HdrAutoOutlinedIcon from '@mui/icons-material/HdrAutoOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import PlaylistAddCheckCircleOutlinedIcon from '@mui/icons-material/PlaylistAddCheckCircleOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
/**
 * 
 * @param status 
 * @returns Icon based on the statuses, Active, Inactive, Disabled or Blocked
 */

/*
*/

const TimeLineDot = ({ status }: ITimeLineDot) => {

    return status === "requestCreated" ? (
        <AddTaskIcon fontSize='small' color="success" sx={{ mr: "5px" }} />
    ) : status === "requestRejected" ? (
        <HighlightOffIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />
    ) : status === "requestApproved" ? (
        <RecommendOutlinedIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />
    ) : status === "requestAcknowledged" ? (
        <HdrAutoOutlinedIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />
    ) : status === "requestIssued" ? (
        <PublishedWithChangesOutlinedIcon fontSize='small' color="info" sx={{ mr: "5px" }} />
    ) : status === "issuanceApproved" ? (
        <PlaylistAddCheckCircleOutlinedIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />
    ) : status === "receiptAcknowledged" ? (
        <ThumbUpOffAltOutlinedIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />
    ) : status === "issuanceAvailable" ? (
        <ErrorOutlineIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />
    ) : status === "requireUpdate" ? (
        <EditCalendarOutlinedIcon fontSize='small' color="error" sx={{ mr: "5px" }} />
    ) : status === "in stock" ? (
        <CheckCircleOutlineOutlinedIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />
    )
        : <DoDisturbAltIcon fontSize='small' color="secondary" sx={{ mr: "5px" }} />
}

export default TimeLineDot