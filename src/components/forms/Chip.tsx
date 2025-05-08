/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Chip } from '@mui/material'
import { IChip } from './interface'

const ChipComponent = ({
    label,
    icon,
    variant = 'outlined',
    size = "medium",
    color = "success"
}: IChip) => {
    return (
        <Chip
            color={color}
            size={size}
            label={label}
            icon={icon}
            variant={variant}
        />
    )
}

export default ChipComponent