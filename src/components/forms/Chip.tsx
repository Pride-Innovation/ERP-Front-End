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