import Checkbox from '@mui/material/Checkbox';
import { ChangeEvent } from 'react';
import { ICheckboxComponent } from './interface';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

export default function CheckboxComponent({ checked, handleChangeEvent, name }: ICheckboxComponent) {
    return (
        <div>
            <Checkbox
                checked={checked}
                name={name as string}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChangeEvent(e)}
                {...label} />
        </div>
    );
}