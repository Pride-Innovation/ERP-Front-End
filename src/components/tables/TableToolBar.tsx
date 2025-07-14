/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    GridToolbarContainer,
} from '@mui/x-data-grid';
import ButtonComponent from '../forms/Button';
import { Box, Stack, TextField, useTheme } from '@mui/material';
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
    createAction,
    searchAction,
    refresh
}: ITableToolBar) => {
    const { setFileName } = useContext(FileContext);
    useEffect(() => { setFileName(module) }, [module]);
    const theme = useTheme();

    return (
        <GridToolbarContainer
            sx={{ width: '100%', display: 'flex', p: '20px' }}>
            <TypographyComponent size='17px' color="#BC892C" weight={600} sx={{ textTransform: "uppercase" }}>{header.plural}</TypographyComponent>
            <Stack direction="row" spacing={2} sx={{ ml: "auto" }}>
                {searchAction && <TextField size='small' placeholder="Search" variant='outlined' sx={{ color: theme.palette.success.main }} />}
                {refresh &&
                    <Box>
                        <ButtonComponent
                            handleClick={() => window.location.reload()}
                            sendingRequest={false}
                            buttonText="Refresh"
                            variant='outlined'
                            buttonColor='primary'
                            type='button'
                        />
                    </Box>
                }
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
    searchAction,
    header,
    onCreationHandler,
    module,
    refresh,
    ...props
}) => {
    return (
        <TableToolBar
            createAction={createAction}
            importData={importData}
            exportData={exportData}
            header={header}
            searchAction={searchAction}
            onCreationHandler={onCreationHandler}
            module={module}
            {...props}
            refresh={refresh}
        />
    );
};

export default CustomToolbarWrapper;
