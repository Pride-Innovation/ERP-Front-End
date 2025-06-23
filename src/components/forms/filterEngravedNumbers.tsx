import {
    Autocomplete,
    TableCell,
    TextField,
    Chip,
    useTheme
} from '@mui/material';

const FilterEngravedNumbers = () => {
    const theme = useTheme()
    return (
        <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
            <Autocomplete
                multiple
                id="engraved-numbers"
                size="small"
                options={top100Films}
                getOptionLabel={(option) => option?.title || ''}
                // defaultValue={[top100Films[2]]}
                filterSelectedOptions
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="filled"
                            label={option.title}
                            {...getTagProps({ index })}
                            sx={{
                                backgroundColor: '#08796C',
                                color: theme.palette.background.paper,
                                fontWeight: 500,
                                borderRadius: 1,
                                fontSize: 12,
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select"
                        variant="standard"
                        InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                        }}
                        sx={{
                            backgroundColor: '#08796C20',
                            borderRadius: 2,
                            px: 1.2,
                            py: 0.8,
                            '& .MuiInputBase-input': {
                                color: '#000',
                                fontWeight: 500,
                            },
                            '& input::placeholder': {
                                color: '#08796C',
                                opacity: 1,
                                fontWeight: 500,
                                fontStyle: "italic",
                                fontSize: "14px"
                            },
                        }}
                    />
                )}
            />
        </TableCell>
    );
};

export default FilterEngravedNumbers;

// Sample options
const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 },
];
