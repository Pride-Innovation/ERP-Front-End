import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import React, { useEffect, useState } from 'react';
import { ITimePickerComponent } from './interface';
import dayjs, { Dayjs } from 'dayjs';

const TimePickerComponent: React.FC<ITimePickerComponent> = ({ label, error, field }) => {

    const [parsedValue, setParsedValue] = useState<Dayjs | null>(null);

    useEffect(() => {
        if (field.value) {
            setParsedValue(dayjs(field.value));
        } else {
            setParsedValue(null);
        }
    }, [field.value]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                slotProps={{
                    textField: {
                        size: "small",
                        error: Boolean(error),
                        required: true
                    }
                }}
                label={label}
                value={parsedValue}
                onChange={(newValue) => {
                    field.onChange(newValue ? newValue : null);
                    setParsedValue(newValue);
                }}
            />
        </LocalizationProvider>
    );
}

export default TimePickerComponent;