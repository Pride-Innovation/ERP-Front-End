import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IDatePickerComponent } from './interface';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

const DatePickerComponent = ({ label, field, error }: IDatePickerComponent) => {
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
            <DatePicker
                format='DD-MM-YYYY'
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
                    field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
                    setParsedValue(newValue);
                }}
            />
        </LocalizationProvider>
    );
};

export default DatePickerComponent;