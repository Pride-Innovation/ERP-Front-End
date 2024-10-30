import Checkbox from '@mui/material/Checkbox';
import { ChangeEvent } from 'react';
import { ICheckboxComponent } from './interface';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

export default function CheckboxComponent({ checked }: ICheckboxComponent) {
    const handleChange = async (event: ChangeEvent<HTMLInputElement>, verb: string) => { }
    return (
        <div>
            <Checkbox
                checked={checked}
                onChange={(e) => handleChange}
                {...label} />
        </div>
    );
}