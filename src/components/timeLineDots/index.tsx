/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ITimeLineDot } from './interface'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';

/**
 * 
 * @param status 
 * @returns Icon based on the statuses, Active, Inactive, Disabled or Blocked
 */

/*
*/

const TimeLineDot = ({ status }: ITimeLineDot) => {
    return status === "disabled" ? (
        <HighlightOffIcon fontSize='small' color="error" sx={{ mr: "5px" }} />
    ) : status === "blocked" ? (
        <LockPersonOutlinedIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />
    ) : status === "active" ? (
        <CheckCircleOutlineIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />
    ) : status === "pending" ? (
        <AutorenewIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />
    ) : <DoDisturbAltIcon fontSize='small' color="secondary" sx={{ mr: "5px" }} />
}

export default TimeLineDot