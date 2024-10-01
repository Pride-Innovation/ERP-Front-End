import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IDatePickerComponent } from './interface';

const DatePickerComponent = ({ label, field, error }: IDatePickerComponent) => {
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
                {...field}
            />
        </LocalizationProvider>
    );
}

export default DatePickerComponent;