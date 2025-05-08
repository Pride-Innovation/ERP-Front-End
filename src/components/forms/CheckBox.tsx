/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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