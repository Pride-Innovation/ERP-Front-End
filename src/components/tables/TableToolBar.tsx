import {
    GridCsvExportMenuItem,
    GridCsvExportOptions,
    GridToolbarContainer,
    GridToolbarExportContainer,
    GridExportMenuItemProps,
    gridFilteredSortedRowIdsSelector,
    gridVisibleColumnFieldsSelector,
    GridApi,
    useGridApiContext
} from '@mui/x-data-grid';
import ButtonComponent from '../forms/Button';
import { Box, ButtonProps, MenuItem, Stack } from '@mui/material';
import { TypographyComponent } from '../headers/TypographyComponent';
import { CustomToolbarWrapperProps, ITableToolBar } from './interface';
import FileUploadButton from '../forms/FileUploadButton';

const getJson = (apiRef: React.MutableRefObject<GridApi>) => {
    const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);

    const data = filteredSortedRowIds.map((id) => {
        const row: Record<string, any> = {};
        visibleColumnsField.forEach((field) => {
            row[field] = apiRef.current.getCellParams(id, field).value;
        });
        return row;
    });

    return JSON.stringify(data, null, 2);
};


const exportBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    });
};


const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
    const apiRef = useGridApiContext();

    const { hideMenu } = props;

    return (
        <MenuItem
            onClick={() => {
                const jsonString = getJson(apiRef);
                const blob = new Blob([jsonString], {
                    type: 'text/json',
                });
                exportBlob(blob, 'DataGrid_demo.json');

                hideMenu?.();
            }}
        >
            Export PDF
        </MenuItem>
    );
}


const csvOptions: GridCsvExportOptions = {};

const CustomGridToolbarExport = (props: ButtonProps) => {
    return (
        <GridToolbarExportContainer {...props}>
            <GridCsvExportMenuItem options={csvOptions} />
            <JsonExportMenuItem />
        </GridToolbarExportContainer>
    )
}

const TableToolBar = ({
    header,
    onCreationHandler,
    module,
    importData,
    exportData,
    createAction
}: ITableToolBar) => {
    return (
        <GridToolbarContainer
            sx={{ width: '100%', display: 'flex', p: '20px' }}>
            <TypographyComponent size='17px' weight={600} sx={{ textTransform: "uppercase" }}>{header.plural}</TypographyComponent>
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
                    <FileUploadButton title={header.plural} module={module} />
                </Box>}
                {exportData && <CustomGridToolbarExport />}
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
    module,
    ...props
}) => {
    return (
        <TableToolBar
            createAction={createAction}
            importData={importData}
            exportData={exportData}
            header={header}
            onCreationHandler={onCreationHandler}
            module={module}
            {...props}
        />
    );
};

export default CustomToolbarWrapper;
