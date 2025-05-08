import {
    GridToolbarContainer,
} from '@mui/x-data-grid';
import ButtonComponent from '../forms/Button';
import { Box, Stack } from '@mui/material';
import { TypographyComponent } from '../headers/TypographyComponent';
import { CustomToolbarWrapperProps, ITableToolBar } from './interface';
import FileUploadButton from '../forms/FileUploadButton';
import CustomGridToolbarExport from './CustomGridToolbarExport';
import { useContext, useEffect } from 'react';
import { FileContext } from '../../context/file/FileContext';

const TableToolBar = ({
    header,
    onCreationHandler,
    module,
    importData,
    exportData,
    createAction
}: ITableToolBar) => {
    const { setFileName } = useContext(FileContext);
    useEffect(() => { setFileName(module) }, [module]);

    return (
        <GridToolbarContainer
            sx={{ width: '100%', display: 'flex', p: '20px' }}>
            <TypographyComponent size='17px' color="#BC892C" weight={600} sx={{ textTransform: "uppercase" }}>{header.plural}</TypographyComponent>
            <Stack direction="row" spacing={2} sx={{ ml: "auto" }}>
                {createAction && <Box>
                    <ButtonComponent
                        handleClick={() => onCreationHandler()}
                        sendingRequest={false}
                        buttonText={`Create ${header.singular} `}
                        variant='contained'
                        buttonColor='success'
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
