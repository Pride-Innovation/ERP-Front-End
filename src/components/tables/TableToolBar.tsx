import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid'
import ButtonComponent from '../forms/Button'
import { Box, Stack } from '@mui/material'
import { TypographyComponent } from '../headers/TypographyComponent'
import { CustomToolbarWrapperProps, ITableToolBar } from './interface'

const TableToolBar = ({
    header,
    onCreationHandler,
    onImportHandler
}: ITableToolBar) => {
    return (
        <GridToolbarContainer
            sx={{ width: '100%', display: 'flex', p: '20px' }}>
            <TypographyComponent size='17px' weight={600}>{header.plural}</TypographyComponent>
            <Stack direction="row" spacing={2} sx={{ ml: "auto" }}>
                <Box>
                    <ButtonComponent
                        handleClick={() => onCreationHandler()}
                        sendingRequest={false}
                        buttonText={`Create ${header.singular} `}
                        variant='contained'
                        buttonColor='info'
                        type='button' />
                </Box>
                <Box>
                    <ButtonComponent
                        handleClick={() => onImportHandler()}
                        sendingRequest={false}
                        buttonText={`Import ${header.plural}`}
                        variant='outlined'
                        buttonColor='info'
                        type='button' />
                </Box>
                <GridToolbarExport />
            </Stack>
        </GridToolbarContainer>
    )
}

const CustomToolbarWrapper: React.FC<CustomToolbarWrapperProps> = ({
    header,
    onCreationHandler,
    onImportHandler,
    ...props
}) => {
    return (
        <TableToolBar
            header={header}
            onCreationHandler={onCreationHandler}
            onImportHandler={onImportHandler}
            {...props}
        />
    );
};

export default CustomToolbarWrapper;
