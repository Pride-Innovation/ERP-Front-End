import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid'
import ButtonComponent from '../forms/Button'
import { Box, Stack } from '@mui/material'
import { TypographyComponent } from '../headers/TypographyComponent'
import { CustomToolbarWrapperProps, ITableToolBar } from './interface'

const TableToolBar = ({
    header,
    onCreationHandler,
    onImportHandler,
    importData,
    exportData,
    createAction
}: ITableToolBar) => {
    return (
        <GridToolbarContainer
            sx={{ width: '100%', display: 'flex', p: '20px' }}>
            <TypographyComponent size='17px' weight={600}>{header.plural}</TypographyComponent>
            <Stack direction="row" spacing={2} sx={{ ml: "auto" }}>
                {createAction && <Box>
                    <ButtonComponent
                        handleClick={() => onCreationHandler()}
                        sendingRequest={false}
                        buttonText={`Create ${header.singular} `}
                        variant='contained'
                        buttonColor='info'
                        type='button' />
                </Box>}
                {importData && <Box>
                    <ButtonComponent
                        handleClick={() => onImportHandler()}
                        sendingRequest={false}
                        buttonText={`Import ${header.plural}`}
                        variant='outlined'
                        buttonColor='info'
                        type='button' />
                </Box>}
                {exportData && <GridToolbarExport />}
            </Stack>
        </GridToolbarContainer>
    )
}

const CustomToolbarWrapper: React.FC<CustomToolbarWrapperProps> = ({
    createAction,
    importData,
    exportData,
    header,
    onCreationHandler,
    onImportHandler,
    ...props
}) => {
    return (
        <TableToolBar
            createAction={createAction}
            importData={importData}
            exportData={exportData}
            header={header}
            onCreationHandler={onCreationHandler}
            onImportHandler={onImportHandler}
            {...props}
        />
    );
};

export default CustomToolbarWrapper;
