import Checkbox from '@mui/material/Checkbox';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

export default function CheckboxComponent() {
    return (
        <div>
            <Checkbox {...label} />
        </div>
    );
}