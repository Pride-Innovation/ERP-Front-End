/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ButtonProps, Box, alpha } from "@mui/material";
import {
    // GridCsvExportMenuItem,
    // GridCsvExportOptions,
    GridToolbarExportContainer
} from "@mui/x-data-grid";
import TableUtills from "./utills";

interface CustomGridToolbarExportProps extends ButtonProps {
    module?: string;
}

const CustomGridToolbarExport = (props: CustomGridToolbarExportProps) => {

    // const csvOptions: GridCsvExportOptions = {};
    const { module, ...restProps } = props;
    const { JsonExportMenuItem, ExcelExportMenuItem } = TableUtills({ moduleName: module });

    return (
        <Box
            sx={{
                '& .MuiButton-root': {
                    height: 40,
                    px: 2,
                    borderRadius: '8px',
                    border: `1px solid ${alpha('#000', 0.18)}`,
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': {
                        border: `1px solid ${alpha('#000', 0.3)}`,
                        bgcolor: alpha('#000', 0.04),
                        boxShadow: 'none',
                    },
                    transition: 'all 0.2s ease',
                },
            }}
        >
            <GridToolbarExportContainer {...restProps}>
                {/* <GridCsvExportMenuItem options={csvOptions} /> */}
                <ExcelExportMenuItem />
                <JsonExportMenuItem />
            </GridToolbarExportContainer>
        </Box>
    );
}

export default CustomGridToolbarExport;